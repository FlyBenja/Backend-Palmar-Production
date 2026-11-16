const express = require('express');
const router = express.Router();
const {
  listarUsuarios,
  listarProductosParaAsignar,
  listarAsignaciones,
  asignarProducto,
  quitarAsignacion,
  listarMisProductos,
  registrarConsumos,
  listarHistorial,
  listarMiHistorial,
} = require('./insumosCocinaController');
const { verificarToken, autorizarRoles, ROLES } = require('../../middlewares/authMiddleware');

router.use(verificarToken);

router.get('/usuarios', autorizarRoles(ROLES.MANAGER), listarUsuarios);
router.get('/productos-disponibles', autorizarRoles(ROLES.MANAGER), listarProductosParaAsignar);
router.get('/asignaciones', autorizarRoles(ROLES.MANAGER), listarAsignaciones);
router.post('/asignaciones', autorizarRoles(ROLES.MANAGER), asignarProducto);
router.delete('/asignaciones/:id', autorizarRoles(ROLES.MANAGER), quitarAsignacion);
router.get('/historial', autorizarRoles(ROLES.MANAGER), listarHistorial);

router.get('/mis-productos', autorizarRoles(ROLES.INSUMOS_COCINA), listarMisProductos);
router.post('/consumos', autorizarRoles(ROLES.INSUMOS_COCINA), registrarConsumos);
router.get('/mis-consumos', autorizarRoles(ROLES.INSUMOS_COCINA), listarMiHistorial);

module.exports = router;
