const express = require('express');
const router = express.Router();

const { listarClientes, obtenerCliente } = require('./clienteController');
const { verificarToken, autorizarRoles, ROLES } = require('../../../middlewares/authMiddleware');

/**
 * @swagger
 * /api/clientes:
 *   get:
 *     summary: Listar clientes con resumen de hospedajes
 *     tags:
 *       - Clientes
 *     responses:
 *       200:
 *         description: Clientes obtenidos correctamente
 *       403:
 *         description: Disponible únicamente para Manager
 */
router.get(
  '/',
  verificarToken,
  autorizarRoles(ROLES.MANAGER),
  listarClientes
);

/**
 * @swagger
 * /api/clientes/{reservacionId}:
 *   get:
 *     summary: Obtener detalle e historial de un cliente
 *     tags:
 *       - Clientes
 *     parameters:
 *       - in: path
 *         name: reservacionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cliente obtenido correctamente
 *       404:
 *         description: Cliente no encontrado
 */
router.get(
  '/:reservacionId',
  verificarToken,
  autorizarRoles(ROLES.MANAGER),
  obtenerCliente
);

module.exports = router;
