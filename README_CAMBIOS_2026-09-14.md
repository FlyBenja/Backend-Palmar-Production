# Cambios Hotel Palmar - 2026-09-14

## Producción

### Reservaciones
- Nuevo campo obligatorio `telefono_cliente`.
- `npm run db:init` agrega la columna a bases existentes sin eliminar datos.
- Las reservaciones históricas quedan con teléfono nulo hasta que existan nuevos registros.

### Clientes (solo Manager)
- `GET /api/clientes`
- `GET /api/clientes/:reservacionId`
- Consolida huéspedes por NIT; si no existe NIT, usa teléfono y luego nombre.
- Expone total de reservaciones, hospedajes pagados, total pagado y el historial.

### Tipo de pago
- Seeder agrega `TRANSFERENCIA` / `Transferencia`.
- Reporte financiero la incluye automáticamente por usar el catálogo activo de tipos de pago.

## Despliegue backend

```bash
cd /home/hotelpalmar/backend
npm install
npm run db:init
npm start
```

No es necesario borrar la base de datos.
