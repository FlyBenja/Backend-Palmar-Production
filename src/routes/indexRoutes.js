const express = require('express');
const router = express.Router();

const authRoutes = require('../modules/auth/authRoutes');
const usuariosRoutes = require('../modules/usuarios/usuariosRoutes');

const habitacionRoutes = require('../modules/hotel/habitaciones/habitacionRoutes');
const habitacionImagenRoutes = require('../modules/hotel/imagenes/habitacionImagenRoutes');
const estadoHabitacionRoutes = require('../modules/hotel/estados/estadoHabitacionRoutes');
const reservacionRoutes = require('../modules/hotel/reservaciones/reservacionRoutes');
const clienteRoutes = require('../modules/hotel/clientes/clienteRoutes');
const tarifaRoutes = require('../modules/hotel/tarifas/tarifaRoutes');

const inventarioRoutes = require('../modules/restaurante/inventario/inventarioRoutes');
const menuRoutes = require('../modules/restaurante/menu/menuRoutes');
const ordenRoutes = require('../modules/restaurante/ordenes/ordenRoutes');
const reporteFinancieroRoutes = require('../modules/restaurante/reportes/reporteFinancieroRoutes');
const eventoRoutes = require('../modules/restaurante/eventos/eventoRoutes');
const creditoRoutes = require('../modules/restaurante/creditos/creditoRoutes');
const inmobiliarioRoutes = require('../modules/inmobiliario/inmobiliarioRoutes');
const insumosRoutes = require('../modules/insumos/insumosRoutes');
const insumosCocinaRoutes = require('../modules/insumosCocina/insumosCocinaRoutes');

router.use('/auth', authRoutes);
router.use('/usuarios', usuariosRoutes);

router.use('/habitaciones', habitacionRoutes);
router.use('/habitaciones', habitacionImagenRoutes);
router.use('/estados-habitacion', estadoHabitacionRoutes);
router.use('/reservaciones', reservacionRoutes);
router.use('/clientes', clienteRoutes);
router.use('/tarifas', tarifaRoutes);

router.use('/inventario', inventarioRoutes);
router.use('/menu', menuRoutes);
router.use('/ordenes', ordenRoutes);
router.use('/reportes', reporteFinancieroRoutes);
router.use('/eventos', eventoRoutes);
router.use('/creditos', creditoRoutes);
router.use('/inmobiliario', inmobiliarioRoutes);
router.use('/insumos', insumosRoutes);
router.use('/insumos-cocina', insumosCocinaRoutes);

module.exports = router;