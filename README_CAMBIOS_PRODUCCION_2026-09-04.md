# Hotel Palmar - actualización de producción 2026-09-04

## Cambios principales

- Reservaciones futuras ya no bloquean la habitación antes de la fecha de entrada; el backend valida traslapes por rango al crear una reserva.
- Sincronización en tiempo real de órdenes/recibos mediante SSE, sin polling cada 5 segundos.
- Cocina recibe nuevas órdenes automáticamente y expone la imagen del plato.
- Al marcar una orden como ENTREGADA se emite actualización para Recibos pendientes.
- El tipo técnico del menú se deriva de la categoría; el frontend ya no solicita un campo Tipo duplicado.
- Nuevo módulo **Inmobiliario**, independiente del inventario y de las finanzas, exclusivo de Manager:
  - categorías
  - productos/cantidades
  - entradas y salidas manuales
  - historial de movimientos
- Swagger incorpora la etiqueta y endpoints de Inmobiliario.

## Actualización en Webmin

No es necesario borrar la base de datos.

1. Detener el proceso Node actual.
2. Reemplazar/copiar el backend nuevo a la carpeta desde la que se ejecuta Node.
3. Ejecutar:

```bash
npm install
npm run db:init
npm run test:dates
npm start
```

`npm run db:init` crea las tablas nuevas de Inmobiliario si no existen y conserva las existentes.

## Producción

El `.env` de este paquete se mantiene con la configuración de producción del ZIP entregado por el usuario. Swagger toma `SERVER_URL` desde ese archivo.
