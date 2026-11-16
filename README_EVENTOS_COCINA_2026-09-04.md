# Eventos de Cocina entre dispositivos

Se agregó un canal long-polling autenticado para actualización inmediata entre dispositivos:

- `GET /api/ordenes/eventos/esperar?desde=N`
- Requiere JWT y roles Manager, Empleado o Cocina.
- La petición queda pendiente hasta 25 segundos.
- Al crear/actualizar/cancelar una orden, el backend responde inmediatamente a los clientes en espera.
- El frontend recarga `/api/ordenes/cocina/hoy` y abre una nueva espera.

No es necesario polling por intervalos ni un botón de actualización manual.

Al desplegar esta versión no hay cambios de base de datos específicos para esta mejora; basta con `npm install` y reiniciar el backend. Si se está desplegando junto con otros cambios recientes, puede ejecutarse `npm run db:init` de forma idempotente.
