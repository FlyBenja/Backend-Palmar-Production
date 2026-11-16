# Módulo de Insumos de Habitaciones - 2026-09-17

## Cambios de base de datos
`npm run db:init` conserva la información existente y agrega:

- Rol `Insumos` (id 4).
- Tabla `insumos_asignaciones`.
- Tabla `insumos_consumos`.

No es necesario borrar la base de datos.

## Flujo
1. Manager entra a **Insumos habitaciones**.
2. Crea uno o más usuarios con rol Insumos.
3. Asigna productos existentes de `productos_inventario` a cada usuario.
4. El usuario inicia sesión y accede únicamente a `/insumos`.
5. Selecciona una reservación confirmada/pagada y registra cantidades entregadas.
6. El backend valida asignación y stock dentro de una transacción, descuenta inventario y registra auditoría.
7. Manager consulta el historial con filtros por usuario, producto, reserva y fechas.

Los consumos se registran también en `inventario_movimientos` como `SALIDA` con `referencia_tipo = INSUMO_RESERVACION`.

- Ajuste posterior: se eliminó `POST /api/insumos/usuarios`; los usuarios de Insumos se crean con `POST /api/usuarios` y `rol_id=4` desde Swagger.
- El historial de Manager ya no filtra por `reservacion_id`; conserva filtros de usuario, producto y fechas.
