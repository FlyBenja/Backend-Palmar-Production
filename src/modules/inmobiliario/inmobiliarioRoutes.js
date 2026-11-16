const express = require('express');
const router = express.Router();
const {
  listarCategorias,
  crearCategoria,
  editarCategoria,
  listarProductos,
  crearProducto,
  editarProducto,
  crearMovimiento,
  listarMovimientos,
} = require('./inmobiliarioController');
const { verificarToken, autorizarRoles, ROLES } = require('../../middlewares/authMiddleware');

router.use(verificarToken, autorizarRoles(ROLES.MANAGER));
router.get('/categorias', listarCategorias);
router.post('/categorias', crearCategoria);
router.patch('/categorias/:id', editarCategoria);
router.get('/productos', listarProductos);
router.post('/productos', crearProducto);
router.patch('/productos/:id', editarProducto);
router.get('/movimientos', listarMovimientos);
router.post('/movimientos', crearMovimiento);

module.exports = router;
