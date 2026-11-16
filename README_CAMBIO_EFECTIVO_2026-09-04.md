# Registro de efectivo y cambio - Producción

Esta versión registra para pagos en efectivo:

- monto cobrado (`monto` / `precio_pagado` / `total`)
- efectivo recibido (`efectivo_recibido`)
- cambio devuelto (`cambio_devuelto`)

Se aplica a:

- reservaciones
- créditos
- eventos
- recibos/facturas del restaurante

## Actualización de base existente

No borres la base de datos. Después de copiar esta versión a `/home/hotelpalmar/backend` ejecuta:

```bash
npm install
npm run db:init
npm start
```

`npm run db:init` agrega automáticamente, si hacen falta, las columnas `efectivo_recibido` y `cambio_devuelto` en `reservaciones`, `pagos`, `eventos` y `creditos`.

Los registros históricos quedan con esos campos en `NULL`; los nuevos pagos en efectivo guardarán sus valores.
