const express = require('express');
const router = express.Router();
const { verificarToken, autorizarRoles, ROLES } = require('../../../middlewares/authMiddleware');
const { listarCreditos, crearCredito, agregarCargoCredito, obtenerFacturaCredito, pagarCredito } = require('./creditoController');

/**
 * @swagger
 * /api/creditos:
 *   get:
 *     summary: Listar créditos
 *     tags: [Créditos]
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema: { type: string, enum: [PENDIENTE, PAGADO, CANCELADO] }
 *       - in: query
 *         name: fecha_inicio
 *         schema: { type: string, format: date }
 *         description: Fecha inicial en Guatemala (YYYY-MM-DD)
 *       - in: query
 *         name: fecha_fin
 *         schema: { type: string, format: date }
 *         description: Fecha final inclusiva en Guatemala (YYYY-MM-DD)
 *     responses:
 *       200: { description: Créditos obtenidos correctamente }
 *   post:
 *     summary: Crear crédito
 *     tags: [Créditos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cliente_nombre]
 *             properties:
 *               cliente_nombre: { type: string, example: Juan Pérez }
 *               nit: { type: string, example: CF }
 *               telefono: { type: string }
 *               empresa: { type: string }
 *               descripcion: { type: string }
 *     responses:
 *       201: { description: Crédito creado correctamente }
 */
router.get('/', verificarToken, autorizarRoles(ROLES.MANAGER, ROLES.EMPLEADO), listarCreditos);
router.post('/', verificarToken, autorizarRoles(ROLES.MANAGER, ROLES.EMPLEADO), crearCredito);

/**
 * @swagger
 * /api/creditos/{id}/cargos:
 *   post:
 *     summary: Agregar cargo a un crédito
 *     tags: [Créditos]
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
 *             required: [descripcion, monto]
 *             properties:
 *               tipo_cargo: { type: string, example: MANUAL }
 *               descripcion: { type: string }
 *               monto: { type: number }
 *               reservacion_id: { type: integer, nullable: true }
 *               habitacion_id: { type: integer, nullable: true }
 *     responses:
 *       201: { description: Cargo agregado al crédito }
 */
router.post('/:id/cargos', verificarToken, autorizarRoles(ROLES.MANAGER, ROLES.EMPLEADO), agregarCargoCredito);

/**
 * @swagger
 * /api/creditos/{id}/factura:
 *   get:
 *     summary: Obtener recibo de crédito
 *     tags: [Créditos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Recibo de crédito obtenido correctamente }
 */
router.get('/:id/factura', verificarToken, autorizarRoles(ROLES.MANAGER, ROLES.EMPLEADO), obtenerFacturaCredito);

/**
 * @swagger
 * /api/creditos/{id}/pagar:
 *   patch:
 *     summary: Pagar crédito
 *     tags: [Créditos]
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
 *     responses:
 *       200: { description: Crédito pagado correctamente }
 */
router.patch('/:id/pagar', verificarToken, autorizarRoles(ROLES.MANAGER, ROLES.EMPLEADO), pagarCredito);

module.exports = router;
