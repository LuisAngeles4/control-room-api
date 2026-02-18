#  IoT Smart Rehearsal Room

Aplicación Web IoT para el monitoreo y control de un cuarto de ensayo musical.

---

##  Descripción

Este proyecto consiste en el desarrollo de una solución IoT que permite administrar, controlar y monitorear dispositivos instalados en un cuarto de ensayo musical mediante una arquitectura basada en API REST utilizando MockAPI como base de datos simulada.

La aplicación permite:

- Crear, editar y eliminar dispositivos.
- Encender y apagar equipos.
- Ajustar niveles de funcionamiento (0–100).
- Registrar eventos automáticamente.
- Visualizar gráficamente el estado de cada dispositivo.
- Consultar los últimos 10 eventos.
- Actualización automática cada 2 segundos.

---

##  Arquitectura

Frontend:
- HTML
- CSS
- JavaScript
- Bootstrap 5

Backend:
- MockAPI (API REST)
- Métodos HTTP: GET, POST, PUT, DELETE

---

## Funcionalidades

###  Administración de dispositivos
- CRUD completo
- Gestión mediante modales
- Validación de datos

###  Control del cuarto
- Interruptor ON/OFF
- Control de nivel
- Indicador visual de estado
- Registro automático de eventos

###  Monitoreo en tiempo real
- Gráfica por dispositivo
- Tabla con los últimos 10 eventos
- Refresco automático cada 2 segundos

---

##  Tipos de dispositivos

- Luz
- Audio
- Sensor
- Efecto

---

##  Modos de operación

- Manual
- Automático
- Eco
- Show

---

## Reglas de negocio

- Deben existir al menos 3 dispositivos.
- No se puede modificar el nivel si el dispositivo está apagado.
- Cada cambio genera un log.
- Solo se muestran los últimos 10 registros.
- Actualización automática cada 2 segundos.

---

##  Cómo ejecutar el proyecto

1. Clonar el repositorio.
2. Configurar la URL de MockAPI en el archivo JS.
3. Abrir el archivo `index.html` en el navegador.

---

##  Objetivo

Simular un sistema IoT inteligente para la gestión y monitoreo de un cuarto de ensayo musical, integrando administración, control y supervisión en tiempo real.

---

##  Autor

Luis Angeles

Proyecto académico – Aplicaciones IoT
