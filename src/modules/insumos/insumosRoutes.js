const express = require('express');
const router = express.Router();
const {
  listarUsuariosInsumos,
  listarProductosParaAsignar,
  listarAsignaciones,
  asignarProducto,
  quitarAsignacion,
  listarMisProductos,
  listarReservacionesDisponibles,
  registrarConsumos,
  listarHistorial,
  listarMiHistorial,
} = require('./insumosController');
const { verificarToken, autorizarRoles, ROLES } = require('../../middlewares/authMiddleware');

router.use(verificarToken);

router.get('/usuarios', autorizarRoles(ROLES.MANAGER), listarUsuariosInsumos);
router.get('/productos-disponibles', autorizarRoles(ROLES.MANAGER), listarProductosParaAsignar);
router.get('/asignaciones', autorizarRoles(ROLES.MANAGER), listarAsignaciones);
router.post('/asignaciones', autorizarRoles(ROLES.MANAGER), asignarProducto);
router.delete('/asignaciones/:id', autorizarRoles(ROLES.MANAGER), quitarAsignacion);
router.get('/historial', autorizarRoles(ROLES.MANAGER), listarHistorial);

router.get('/mis-productos', autorizarRoles(ROLES.INSUMOS), listarMisProductos);
router.get('/reservaciones', autorizarRoles(ROLES.INSUMOS), listarReservacionesDisponibles);
router.post('/consumos', autorizarRoles(ROLES.INSUMOS), registrarConsumos);
router.get('/mis-consumos', autorizarRoles(ROLES.INSUMOS), listarMiHistorial);

module.exports = router;
