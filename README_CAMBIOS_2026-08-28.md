# Hotel Palmar - Cambios de producción 2026-08-28

## Cambios incluidos

- Rangos de fecha por **día / semana / mes** calculados con zona horaria `America/Guatemala` (`UTC-6`).
- Consultas con `fecha_inicio` y `fecha_fin` iguales ahora incluyen el día completo.
- Aplicado a **créditos, eventos, reporte financiero y recibos de restaurante**.
- Fechas de entrada/salida de reservaciones se devuelven como `YYYY-MM-DD`, evitando el desplazamiento de un día por UTC en el frontend.
- Swagger incluye documentación del módulo **Créditos**.
- Tarifas incluyen `mostrar_publico`.
- Endpoint público nuevo: `GET /api/tarifas/publicas` (solo visibles).
- `GET /api/tarifas` queda para Manager/Empleado autenticados y devuelve todas, incluso ocultas.
- `.env` de producción incluido según la configuración solicitada.

## Actualización obligatoria de base de datos

Después de reemplazar el backend y ejecutar `npm install`, ejecutar **una sola vez**:

```bash
npm run db:init
```

El inicializador es idempotente y agregará, si todavía no existe, la columna:

```text
tarifas.mostrar_publico
```

Las tarifas existentes quedan visibles por defecto (`true`).

Después iniciar normalmente:

```bash
npm start
```

## Validación de fechas

```bash
npm run test:dates
```

Debe imprimir:

```text
Pruebas de fechas Guatemala: OK
```
