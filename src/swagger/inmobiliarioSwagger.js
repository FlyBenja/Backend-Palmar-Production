/**
 * @swagger
 * /api/inmobiliario/categorias:
 *   get:
 *     tags: [Inmobiliario]
 *     summary: Listar categorías de inmobiliario
 *     responses:
 *       200:
 *         description: Categorías obtenidas correctamente
 *   post:
 *     tags: [Inmobiliario]
 *     summary: Crear categoría de inmobiliario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre]
 *             properties:
 *               nombre: { type: string, example: Cristalería }
 *               descripcion: { type: string, example: Vasos, copas y recipientes }
 *     responses:
 *       201:
 *         description: Categoría creada correctamente
 *
 * /api/inmobiliario/categorias/{id}:
 *   patch:
 *     tags: [Inmobiliario]
 *     summary: Editar categoría de inmobiliario
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
 *               nombre: { type: string }
 *               descripcion: { type: string }
 *               estado: { type: boolean }
 *     responses:
 *       200:
 *         description: Categoría actualizada correctamente
 *
 * /api/inmobiliario/productos:
 *   get:
 *     tags: [Inmobiliario]
 *     summary: Listar productos de inmobiliario
 *     responses:
 *       200:
 *         description: Productos obtenidos correctamente
 *   post:
 *     tags: [Inmobiliario]
 *     summary: Crear producto con cantidad inicial
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoria_id, nombre]
 *             properties:
 *               categoria_id: { type: integer }
 *               nombre: { type: string, example: Vasos }
 *               descripcion: { type: string }
 *               cantidad_actual: { type: number, example: 20 }
 *     responses:
 *       201:
 *         description: Producto creado correctamente
 *
 * /api/inmobiliario/productos/{id}:
 *   patch:
 *     tags: [Inmobiliario]
 *     summary: Editar producto de inmobiliario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Producto actualizado correctamente
 *
 * /api/inmobiliario/movimientos:
 *   get:
 *     tags: [Inmobiliario]
 *     summary: Listar últimos movimientos
 *     responses:
 *       200:
 *         description: Movimientos obtenidos correctamente
 *   post:
 *     tags: [Inmobiliario]
 *     summary: Agregar o quitar cantidad manualmente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [producto_inmobiliario_id, tipo_movimiento, cantidad]
 *             properties:
 *               producto_inmobiliario_id: { type: integer }
 *               tipo_movimiento:
 *                 type: string
 *                 enum: [ENTRADA, SALIDA]
 *               cantidad: { type: number, example: 1 }
 *               observacion: { type: string, example: Vaso quebrado }
 *     responses:
 *       201:
 *         description: Movimiento registrado correctamente
 */
