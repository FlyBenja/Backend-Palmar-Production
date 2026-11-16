# Cambios 2026-10-02 - Insumos de Cocina y Swagger

- Nuevo rol `Insumos Cocina` (rol_id = 5).
- Nuevo módulo `/api/insumos-cocina` con asignaciones, productos del usuario, salidas manuales e historial.
- Nuevas tablas `insumos_cocina_asignaciones` e `insumos_cocina_consumos`.
- Las salidas descuentan `productos_inventario` dentro de transacción y generan `inventario_movimientos` con referencia `INSUMO_COCINA`.
- El Manager asigna productos; los usuarios se crean desde `/api/usuarios` (Swagger) usando `rol_id: 5`.
- Swagger completado para todas las rutas actuales. `npm run test:swagger` valida cobertura: 94 operaciones documentadas.
- Ejecutar `npm run db:init` una vez al desplegar esta versión para crear el rol y las tablas nuevas sin eliminar datos existentes.
