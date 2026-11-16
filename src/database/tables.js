const crearTablasUsuarios = require('./tablesUsuarios');
const crearTablasHotel = require('./tablesHotel');
const crearTablasRestaurante = require('./tablesRestaurante');
const crearTablasInmobiliario = require('./tablesInmobiliario');
const crearTablasInsumos = require('./tablesInsumos');
const crearTablasInsumosCocina = require('./tablesInsumosCocina');

async function crearTablas() {
  await crearTablasUsuarios();

  await crearTablasHotel();

  await crearTablasRestaurante();

  await crearTablasInmobiliario();

  await crearTablasInsumos();

  await crearTablasInsumosCocina();

  console.log('Proceso de creación de tablas finalizado');
}

module.exports = crearTablas;