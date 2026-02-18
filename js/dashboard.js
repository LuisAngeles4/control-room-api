const API_URL = "https://698c005d21a248a2736032c5.mockapi.io/api/v1/devices";


let isUpdating = false;

/* ================= LOAD ================= */

async function loadDashboard() {
  const res = await fetch(API_URL);
  const devices = await res.json();

  renderKPIs(devices);
  renderControl(devices);
  renderMonitor(devices);
}

/* ================= KPIs ================= */

function renderKPIs(devices) {

  const active = devices.filter(d => d.status === "on").length;

  const totalPower = devices.reduce((sum, d) => {
    if (d.status === "on") {
      return sum + (parseInt(d.power || 0) * (d.value / 100));
    }
    return sum;
  }, 0);

  const totalLogs = devices.reduce((sum, d) => {
    return sum + (d.logs ? d.logs.length : 0);
  }, 0);

  document.getElementById("activeCount").textContent = active;
  document.getElementById("totalPower").textContent = totalPower.toFixed(0);
  document.getElementById("totalLogs").textContent = totalLogs;
}

/* ================= CONTROL ================= */

function renderControl(devices) {

  const container = document.getElementById("deviceCards");
  container.innerHTML = "";

  devices.forEach(device => {

    container.innerHTML += `
    <div class="col-md-4 mb-4">
      <div class="card shadow p-3">

        <div class="d-flex justify-content-between">
          <h6>${device.name}</h6>
          <div>
            <button class="btn btn-sm btn-outline-warning"
              onclick='editDevice(${JSON.stringify(device)})'>✏️</button>
            <button class="btn btn-sm btn-outline-danger"
              onclick='deleteDevice("${device.id}")'>🗑</button>
          </div>
        </div>

        <small class="text-muted">${device.type} | ${device.mode}</small>

        <p class="mt-2">
          Estado:
          <span class="badge bg-${device.status === "on" ? "success" : "secondary"}">
            ${device.status}
          </span>
        </p>

        <button class="btn btn-${device.status === "on" ? "danger" : "success"} mb-3"
          onclick='toggleDevice(${JSON.stringify(device)})'>
          ${device.status === "on" ? "Apagar" : "Encender"}
        </button>

        <label>Nivel</label>
        <input type="range" min="0" max="100"
          value="${device.value}"
          class="form-range"
          onchange='updateValue(${JSON.stringify(device)}, this.value)'>

        <small>Consumo base: ${device.power || 0}W</small>

      </div>
    </div>
    `;
  });
}

/* ================= EDITAR ================= */

function editDevice(device) {

  document.getElementById("deviceId").value = device.id;
  document.getElementById("deviceName").value = device.name;
  document.getElementById("deviceType").value = device.type;
  document.getElementById("deviceMode").value = device.mode;
  document.getElementById("devicePower").value = device.power;

  new bootstrap.Modal(document.getElementById("deviceModal")).show();
}

/* ================= ELIMINAR ================= */

async function deleteDevice(id) {

  if (!confirm("¿Eliminar dispositivo?")) return;

  await fetch(`${API_URL}/${id}`, { method: "DELETE" });

  loadDashboard();
}

/* ================= GUARDAR ================= */

async function saveDevice() {

  const id = document.getElementById("deviceId").value;
  const name = document.getElementById("deviceName").value;
  const type = document.getElementById("deviceType").value;
  const mode = document.getElementById("deviceMode").value;
  const power = document.getElementById("devicePower").value;

  if (id) {
    const res = await fetch(`${API_URL}/${id}`);
    const existingDevice = await res.json();

    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...existingDevice,
        name,
        type,
        mode,
        power: parseInt(power)
      })
    });

  } else {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        type,
        mode,
        power: parseInt(power),
        status: "off",
        value: 0,
        logs: []
      })
    });
  }

  // Recargar dashboard
  await loadDashboard();

  // 🔥 CERRAR MODAL
  const modalElement = document.getElementById("deviceModal");
  const modalInstance = bootstrap.Modal.getInstance(modalElement);
  modalInstance.hide();
}



/* ================= EVENTOS ================= */

async function registerEvent(device, eventName) {

  const newLog = {
    event: eventName,
    status: device.status,
    value: device.value,
    timestamp: new Date().toISOString()
  };

  const logs = device.logs ? [...device.logs, newLog] : [newLog];

  if (logs.length > 20) logs.shift();

  await fetch(`${API_URL}/${device.id}`, {
    method: "PUT",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({...device, logs})
  });
}

/* ================= CONTROL ACTIONS ================= */

async function toggleDevice(device) {

  device.status = device.status === "on" ? "off" : "on";

  if (device.status === "off") device.value = 0;

  await registerEvent(
    device,
    device.status === "on" ? "Encendido" : "Apagado"
  );

  loadDashboard();
}

async function updateValue(device, value) {

  device.value = parseInt(value);

  let event = "Nivel actualizado";
  if (value > 80) event = "Alerta nivel alto";

  await registerEvent(device, event);

  loadDashboard();
}

/* ================= MONITOR ================= */

function renderMonitor(devices) {

  const chartsContainer = document.getElementById("charts");
  const logTable = document.getElementById("logTable");

  chartsContainer.innerHTML = "";
  logTable.innerHTML = "";

  devices.forEach(device => {

    if (!device.logs || device.logs.length === 0) return;

    const lastLogs = device.logs.slice(-10);

    const card = document.createElement("div");
    card.className = "card mb-4 shadow p-3";

    card.innerHTML = `
      <h6>${device.name}</h6>
      <div style="position:relative; height:250px;">
        <canvas id="chart-${device.id}"></canvas>
      </div>
    `;

    chartsContainer.appendChild(card);

    const ctx = document.getElementById(`chart-${device.id}`);

    new Chart(ctx, {
      type: "line",
      data: {
        labels: lastLogs.map(l =>
          new Date(l.timestamp).toLocaleTimeString()
        ),
        datasets: [{
          label: "Nivel (%)",
          data: lastLogs.map(l => l.value),
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, max: 100 }
        }
      }
    });

    lastLogs.forEach(log => {
      logTable.innerHTML += `
        <tr>
          <td>${device.name}</td>
          <td>${log.event}</td>
          <td>${log.status}</td>
          <td>${log.value}</td>
          <td>${new Date(log.timestamp).toLocaleTimeString()}</td>
        </tr>
      `;
    });

  });
}

/* ================= REFRESCO 2 SEG ================= */

document.addEventListener("DOMContentLoaded", () => {

  loadDashboard();

  setInterval(async () => {

    if (isUpdating) return;

    try {
      isUpdating = true;
      await loadDashboard();
    } catch (e) {
      console.log("Error controlado:", e);
    } finally {
      isUpdating = false;
    }

  }, 2000);

});
