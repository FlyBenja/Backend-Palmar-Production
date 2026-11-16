/**
 * @swagger
 * /api/eventos:
 *   get:
 *     tags: [Eventos]
 *     summary: Listar eventos
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema: { type: string }
 *       - in: query
 *         name: fecha_inicio
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: fecha_fin
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Eventos obtenidos correctamente }
 *   post:
 *     tags: [Eventos]
 *     summary: Crear evento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cliente_nombre, descripcion]
 *             properties:
 *               cliente_nombre: { type: string, example: Juan Pérez }
 *               nit: { type: string, example: CF }
 *               telefono: { type: string, example: '37048712' }
 *               empresa: { type: string }
 *               descripcion: { type: string, example: Cumpleaños }
 *               fecha_evento: { type: string, format: date }
 *               cantidad_personas: { type: integer, example: 30 }
 *               monto_cobrado: { type: number, example: 1500 }
 *     responses:
 *       201: { description: Evento creado correctamente }
 *
 * /api/eventos/{id}/factura:
 *   get:
 *     tags: [Eventos]
 *     summary: Obtener factura o detalle de cobro de un evento
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Factura obtenida correctamente }
 *
 * /api/eventos/{id}/cerrar:
 *   patch:
 *     tags: [Eventos]
 *     summary: Cerrar y cobrar un evento
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tipo_pago_id]
 *             properties:
 *               tipo_pago_id: { type: integer, example: 1 }
 *               efectivo_recibido: { type: number, example: 1600 }
 *     responses:
 *       200: { description: Evento cerrado correctamente }
 */

/**
 * @swagger
 * /api/insumos/usuarios:
 *   get:
 *     tags: [Insumos]
 *     summary: Listar usuarios con rol Insumos de Habitación (Manager)
 *     responses:
 *       200: { description: Usuarios obtenidos correctamente }
 * /api/insumos/productos-disponibles:
 *   get:
 *     tags: [Insumos]
 *     summary: Listar productos disponibles para asignar (Manager)
 *     responses:
 *       200: { description: Productos obtenidos correctamente }
 * /api/insumos/asignaciones:
 *   get:
 *     tags: [Insumos]
 *     summary: Listar asignaciones de productos a usuarios de Insumos (Manager)
 *     parameters:
 *       - in: query
 *         name: usuario_id
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Asignaciones obtenidas correctamente }
 *   post:
 *     tags: [Insumos]
 *     summary: Asignar producto a usuario de Insumos (Manager)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [usuario_id, producto_inventario_id]
 *             properties:
 *               usuario_id: { type: integer, example: 4 }
 *               producto_inventario_id: { type: integer, example: 10 }
 *     responses:
 *       201: { description: Producto asignado correctamente }
 * /api/insumos/asignaciones/{id}:
 *   delete:
 *     tags: [Insumos]
 *     summary: Quitar una asignación de producto (Manager)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Asignación desactivada correctamente }
 * /api/insumos/mis-consumos:
 *   get:
 *     tags: [Insumos]
 *     summary: Consultar el historial del usuario de Insumos autenticado
 *     responses:
 *       200: { description: Historial obtenido correctamente }
 */

/**
 * @swagger
 * /api/insumos-cocina/usuarios:
 *   get:
 *     tags: [Insumos Cocina]
 *     summary: Listar usuarios con rol Insumos Cocina (Manager)
 *     responses:
 *       200: { description: Usuarios obtenidos correctamente }
 * /api/insumos-cocina/productos-disponibles:
 *   get:
 *     tags: [Insumos Cocina]
 *     summary: Listar productos de inventario disponibles para asignar (Manager)
 *     parameters:
 *       - in: query
 *         name: categoria_id
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Productos obtenidos correctamente }
 * /api/insumos-cocina/asignaciones:
 *   get:
 *     tags: [Insumos Cocina]
 *     summary: Listar asignaciones de Insumos Cocina (Manager)
 *     parameters:
 *       - in: query
 *         name: usuario_id
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Asignaciones obtenidas correctamente }
 *   post:
 *     tags: [Insumos Cocina]
 *     summary: Asignar producto a un usuario de Insumos Cocina (Manager)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [usuario_id, producto_inventario_id]
 *             properties:
 *               usuario_id: { type: integer, example: 8 }
 *               producto_inventario_id: { type: integer, example: 12 }
 *     responses:
 *       201: { description: Producto asignado correctamente }
 * /api/insumos-cocina/asignaciones/{id}:
 *   delete:
 *     tags: [Insumos Cocina]
 *     summary: Quitar asignación de Insumos Cocina (Manager)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Asignación desactivada correctamente }
 * /api/insumos-cocina/historial:
 *   get:
 *     tags: [Insumos Cocina]
 *     summary: Consultar historial completo de salidas de Insumos Cocina (Manager)
 *     parameters:
 *       - in: query
 *         name: usuario_id
 *         schema: { type: integer }
 *       - in: query
 *         name: producto_inventario_id
 *         schema: { type: integer }
 *       - in: query
 *         name: destino
 *         schema: { type: string }
 *       - in: query
 *         name: desde
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: hasta
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Historial obtenido correctamente }
 * /api/insumos-cocina/mis-productos:
 *   get:
 *     tags: [Insumos Cocina]
 *     summary: Listar productos asignados al usuario Insumos Cocina autenticado
 *     responses:
 *       200: { description: Productos asignados obtenidos correctamente }
 * /api/insumos-cocina/consumos:
 *   post:
 *     tags: [Insumos Cocina]
 *     summary: Registrar salida manual de uno o varios insumos de cocina
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [destino, items]
 *             properties:
 *               destino: { type: string, example: Cocina - turno desayuno }
 *               observacion: { type: string, example: Reposición para preparación }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [producto_inventario_id, cantidad]
 *                   properties:
 *                     producto_inventario_id: { type: integer, example: 12 }
 *                     cantidad: { type: number, example: 2 }
 *     responses:
 *       201: { description: Salida registrada correctamente }
 *       400: { description: Datos inválidos o stock insuficiente }
 *       403: { description: Producto no asignado }
 * /api/insumos-cocina/mis-consumos:
 *   get:
 *     tags: [Insumos Cocina]
 *     summary: Consultar historial del usuario Insumos Cocina autenticado
 *     responses:
 *       200: { description: Historial obtenido correctamente }
 */

/**
 * @swagger
 * /api/menu/categorias/orden:
 *   patch:
 *     tags: [Menú]
 *     summary: Reordenar categorías del menú
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categorias:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id: { type: integer }
 *                     orden: { type: integer }
 *     responses:
 *       200: { description: Orden actualizado correctamente }
 * /api/menu/categorias/{id}:
 *   delete:
 *     tags: [Menú]
 *     summary: Eliminar u ocultar categoría del menú
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Categoría eliminada correctamente }
 */

/**
 * @swagger
 * /api/ordenes/eventos/stream:
 *   get:
 *     tags: [Órdenes]
 *     summary: Stream SSE de eventos de órdenes (compatibilidad)
 *     security: []
 *     responses:
 *       200: { description: Flujo de eventos SSE }
 * /api/ordenes/eventos/esperar:
 *   get:
 *     tags: [Órdenes]
 *     summary: Esperar un cambio de órdenes mediante long-polling autenticado
 *     responses:
 *       200: { description: Evento recibido o tiempo de espera completado }
 * /api/ordenes/mesas/pendientes:
 *   get:
 *     tags: [Órdenes]
 *     summary: Listar mesas con pagos pendientes
 *     responses:
 *       200: { description: Mesas pendientes obtenidas correctamente }
 * /api/ordenes/mesas/{numeroMesa}/factura:
 *   get:
 *     tags: [Órdenes]
 *     summary: Obtener factura pendiente de una mesa
 *     parameters:
 *       - in: path
 *         name: numeroMesa
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Factura obtenida correctamente }
 * /api/ordenes/mesas/{numeroMesa}/pagar:
 *   patch:
 *     tags: [Órdenes]
 *     summary: Pagar factura pendiente de una mesa
 *     parameters:
 *       - in: path
 *         name: numeroMesa
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tipo_pago_id]
 *             properties:
 *               tipo_pago_id: { type: integer, example: 1 }
 *               efectivo_recibido: { type: number, example: 200 }
 *     responses:
 *       200: { description: Factura pagada correctamente }
 * /api/ordenes/facturas/pendientes:
 *   get:
 *     tags: [Órdenes]
 *     summary: Listar facturas directas pendientes de pago
 *     responses:
 *       200: { description: Facturas pendientes obtenidas correctamente }
 * /api/ordenes/facturas/{clave}:
 *   get:
 *     tags: [Órdenes]
 *     summary: Obtener una factura directa pendiente por clave
 *     parameters:
 *       - in: path
 *         name: clave
 *         required: true
 *         schema: { type: string }
 *         example: LLEVAR-15
 *     responses:
 *       200: { description: Factura obtenida correctamente }
 * /api/ordenes/facturas/{clave}/pagar:
 *   patch:
 *     tags: [Órdenes]
 *     summary: Pagar una factura directa pendiente
 *     parameters:
 *       - in: path
 *         name: clave
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tipo_pago_id]
 *             properties:
 *               tipo_pago_id: { type: integer, example: 4 }
 *               efectivo_recibido: { type: number, nullable: true }
 *     responses:
 *       200: { description: Factura pagada correctamente }
 * /api/ordenes/facturas:
 *   get:
 *     tags: [Órdenes]
 *     summary: Listar facturas de restaurante pagadas para Manager
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema: { type: string, enum: [DIA, SEMANA, MES] }
 *       - in: query
 *         name: fecha
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: anio
 *         schema: { type: integer }
 *       - in: query
 *         name: mes
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Facturas obtenidas correctamente }
 * /api/ordenes/{id}/cancelar:
 *   patch:
 *     tags: [Órdenes]
 *     summary: Cancelar una orden y devolver inventario cuando corresponda
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Orden cancelada correctamente }
 */

/**
 * @swagger
 * /api/reportes/financiero/semana:
 *   get:
 *     tags: [Reportes]
 *     summary: Obtener reporte financiero semanal
 *     parameters:
 *       - in: query
 *         name: fecha
 *         schema: { type: string, format: date }
 *         description: Cualquier fecha dentro de la semana a consultar
 *     responses:
 *       200: { description: Reporte semanal obtenido correctamente }
 *
 * /api/reservaciones/{id}/salida-anticipada:
 *   patch:
 *     tags: [Reservaciones]
 *     summary: Registrar salida anticipada de una reservación
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha_salida: { type: string, format: date }
 *     responses:
 *       200: { description: Salida anticipada registrada correctamente }
 */
