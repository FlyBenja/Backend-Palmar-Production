/**
 * @swagger
 * /api/insumos/mis-productos:
 *   get:
 *     summary: Lista los productos de inventario asignados al usuario de Insumos
 *     tags: [Insumos]
 *     responses:
 *       200: { description: Productos asignados }
 * /api/insumos/reservaciones:
 *   get:
 *     summary: Lista reservaciones disponibles para registrar entrega de insumos
 *     tags: [Insumos]
 *     responses:
 *       200: { description: Reservaciones disponibles }
 * /api/insumos/consumos:
 *   post:
 *     summary: Descuenta uno o varios insumos asignados y los vincula a una reservación
 *     tags: [Insumos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reservacion_id, items]
 *             properties:
 *               reservacion_id: { type: integer, example: 15 }
 *               observacion: { type: string, example: "Kit inicial de habitación" }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     producto_inventario_id: { type: integer, example: 3 }
 *                     cantidad: { type: number, example: 1 }
 *     responses:
 *       201: { description: Insumos descontados }
 *       400: { description: Stock insuficiente o datos inválidos }
 *       403: { description: Producto no asignado }
 * /api/insumos/historial:
 *   get:
 *     summary: Historial completo de insumos entregados (Manager)
 *     tags: [Insumos]
 *     responses:
 *       200: { description: Historial de consumos }
 */
