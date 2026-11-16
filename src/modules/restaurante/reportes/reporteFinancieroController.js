const { Op } = require('sequelize');

const Orden = require('../../../models/Orden');
const OrdenDetalle = require('../../../models/OrdenDetalle');
const MenuItem = require('../../../models/MenuItem');
const Reservacion = require('../../../models/Reservacion');
const EstadoReservacion = require('../../../models/EstadoReservacion');
const TipoPago = require('../../../models/TipoPago');
const InventarioMovimiento = require('../../../models/InventarioMovimiento');
const Pago = require('../../../models/Pago');
const { obtenerRangoDiaGuatemala, obtenerRangoSemanaGuatemala, obtenerRangoMesGuatemala } = require('../../../utils/dateUtils');

function obtenerRangoDia(fechaTexto) {
  return obtenerRangoDiaGuatemala(fechaTexto);
}

function obtenerRangoSemana(fechaTexto) {
  return obtenerRangoSemanaGuatemala(fechaTexto);
}

function obtenerRangoMes(anioTexto, mesTexto) {
  return obtenerRangoMesGuatemala(anioTexto, mesTexto);
}

function numero(valor) {
  return Number(valor || 0);
}

function redondear2(valor) {
  return Math.round(numero(valor) * 100) / 100;
}

async function obtenerResumenFinanciero(inicio, fin) {
  const estadoPagada = await EstadoReservacion.findOne({ where: { codigo: 'PAGADA' } });
  const tiposPago = await TipoPago.findAll({ where: { estado: true } });

  const reservaciones = estadoPagada
    ? await Reservacion.findAll({
        where: {
          estado_reservacion_id: estadoPagada.id,
          [Op.or]: [
            { fecha_actualizacion: { [Op.between]: [inicio, fin] } },
            { fecha_creacion: { [Op.between]: [inicio, fin] } }
          ]
        },
        order: [['fecha_actualizacion', 'ASC'], ['fecha_creacion', 'ASC']]
      })
    : [];

  const pagosRestaurante = await Pago.findAll({
    where: {
      estado: 'PAGADO',
      fecha_pago: {
        [Op.between]: [inicio, fin]
      },
      [Op.or]: [
        { orden_id: { [Op.ne]: null } },
        { referencia: { [Op.like]: 'REC-CREDITO%' } },
        { referencia: { [Op.like]: 'REC-EVENTO%' } }
      ]
    },
    order: [['fecha_pago', 'ASC'], ['id', 'ASC']]
  });

  const movimientosInventario = await InventarioMovimiento.findAll({
    where: {
      tipo_movimiento: 'ENTRADA',
      fecha_movimiento: { [Op.between]: [inicio, fin] },
      referencia_tipo: { [Op.ne]: 'REVERSA_ORDEN' }
    },
    order: [['fecha_movimiento', 'ASC'], ['id', 'ASC']]
  });

  const totalesPorTipoPago = {};
  const gastosPorTipoPago = {};

  for (const tipoPago of tiposPago) {
    totalesPorTipoPago[tipoPago.codigo] = {
      id: tipoPago.id,
      codigo: tipoPago.codigo,
      nombre: tipoPago.nombre,
      total: 0
    };

    gastosPorTipoPago[tipoPago.codigo] = {
      id: tipoPago.id,
      codigo: tipoPago.codigo,
      nombre: tipoPago.nombre,
      total: 0
    };
  }

  let totalReservaciones = 0;
  let totalEfectivoRecibido = 0;
  let totalCambioDevuelto = 0;

  const reservacionesFormateadas = reservaciones.map((reservacion) => {
    const monto = numero(reservacion.precio_pagado);
    totalReservaciones += monto;
    totalEfectivoRecibido += numero(reservacion.efectivo_recibido);
    totalCambioDevuelto += numero(reservacion.cambio_devuelto);

    const tipoPago = tiposPago.find((item) => Number(item.id) === Number(reservacion.tipo_pago_id));

    if (tipoPago && totalesPorTipoPago[tipoPago.codigo]) {
      totalesPorTipoPago[tipoPago.codigo].total += monto;
    }

    return {
      id: reservacion.id,
      nombre_cliente: reservacion.nombre_cliente,
      nit: reservacion.nit,
      total_reservacion: reservacion.total_reservacion,
      precio_pagado: reservacion.precio_pagado,
      efectivo_recibido: reservacion.efectivo_recibido ?? null,
      cambio_devuelto: reservacion.cambio_devuelto ?? null,
      tipo_pago_id: reservacion.tipo_pago_id,
      tipo_pago: tipoPago
        ? {
            id: tipoPago.id,
            codigo: tipoPago.codigo,
            nombre: tipoPago.nombre
          }
        : null,
      fecha_pago: reservacion.fecha_actualizacion || reservacion.fecha_creacion,
      fecha_creacion: reservacion.fecha_creacion
    };
  });

  let totalOrdenesDirectas = 0;
  const ordenesFormateadas = [];

  for (const pago of pagosRestaurante) {
    const monto = numero(pago.monto);
    totalOrdenesDirectas += monto;
    totalEfectivoRecibido += numero(pago.efectivo_recibido);
    totalCambioDevuelto += numero(pago.cambio_devuelto);

    const tipoPago = tiposPago.find((item) => Number(item.id) === Number(pago.tipo_pago_id));

    if (tipoPago && totalesPorTipoPago[tipoPago.codigo]) {
      totalesPorTipoPago[tipoPago.codigo].total += monto;
    }

    const orden = await Orden.findByPk(pago.orden_id);
    const detalles = [];

    if (orden) {
      const ordenDetalles = await OrdenDetalle.findAll({ where: { orden_id: orden.id }, order: [['id', 'ASC']] });
      for (const detalle of ordenDetalles) {
        const item = await MenuItem.findByPk(detalle.menu_item_id);
        detalles.push({
          id: detalle.id,
          nombre: item?.nombre || 'Producto',
          cantidad: detalle.cantidad,
          precio_unitario: detalle.precio_unitario,
          subtotal: detalle.subtotal,
          observaciones: detalle.observaciones,
        });
      }
    }

    const referencia = String(pago.referencia || '');
    const tipoOrdenReporte = orden?.tipo_orden || (referencia.startsWith('REC-CREDITO') ? 'CREDITO' : referencia.startsWith('REC-EVENTO') ? 'EVENTO' : null);

    ordenesFormateadas.push({
      id: orden?.id || pago.id,
      tipo_orden: tipoOrdenReporte,
      numero_mesa: orden?.numero_mesa || null,
      habitacion_id: orden?.habitacion_id || null,
      total: monto,
      estado: orden?.estado || 'PAGADO',
      efectivo_recibido: pago.efectivo_recibido ?? null,
      cambio_devuelto: pago.cambio_devuelto ?? null,
      referencia: pago.referencia,
      detalles,
      tipo_pago_id: pago.tipo_pago_id,
      tipo_pago: tipoPago
        ? {
            id: tipoPago.id,
            codigo: tipoPago.codigo,
            nombre: tipoPago.nombre
          }
        : null,
      fecha_pago: pago.fecha_pago,
      fecha_creacion: orden?.fecha_creacion || pago.fecha_creacion
    });
  }

  const movimientosFormateados = [];
  let gastosInventario = 0;

  for (const movimiento of movimientosInventario) {
    const totalMovimiento = numero(movimiento.cantidad) * numero(movimiento.costo_unitario);
    gastosInventario += totalMovimiento;

    const tipoPago = tiposPago.find((item) => Number(item.id) === Number(movimiento.tipo_pago_id));

    if (tipoPago && gastosPorTipoPago[tipoPago.codigo]) {
      gastosPorTipoPago[tipoPago.codigo].total += totalMovimiento;
    }

    movimientosFormateados.push({
      id: movimiento.id,
      producto_inventario_id: movimiento.producto_inventario_id,
      tipo_movimiento: movimiento.tipo_movimiento,
      cantidad: movimiento.cantidad,
      costo_unitario: movimiento.costo_unitario,
      total: redondear2(totalMovimiento),
      tipo_pago_id: movimiento.tipo_pago_id,
      tipo_pago: tipoPago
        ? {
            id: tipoPago.id,
            codigo: tipoPago.codigo,
            nombre: tipoPago.nombre
          }
        : null,
      observacion: movimiento.observacion,
      referencia_tipo: movimiento.referencia_tipo,
      referencia_id: movimiento.referencia_id,
      fecha_movimiento: movimiento.fecha_movimiento
    });
  }

  const totalIngresos = redondear2(totalReservaciones + totalOrdenesDirectas);
  const gananciaTotal = redondear2(totalIngresos - gastosInventario);

  return {
    rango: { inicio, fin },
    resumen: {
      total_reservaciones: redondear2(totalReservaciones),
      total_ordenes: redondear2(totalOrdenesDirectas),
      total_restaurante: redondear2(totalOrdenesDirectas),
      total_ingresos: totalIngresos,
      total_gastos_inventario: redondear2(gastosInventario),
      ganancia_total: gananciaTotal,
      total_general: totalIngresos,
      total_efectivo_recibido: redondear2(totalEfectivoRecibido),
      total_cambio_devuelto: redondear2(totalCambioDevuelto),
      total_efectivo_neto: redondear2(totalEfectivoRecibido - totalCambioDevuelto),
      cantidad_reservaciones: reservaciones.length,
      cantidad_ordenes: pagosRestaurante.length,
      cantidad_movimientos_inventario: movimientosInventario.length,
      totales_por_tipo_pago: Object.values(totalesPorTipoPago).map((item) => ({
        ...item,
        total: redondear2(item.total)
      })),
      gastos_por_tipo_pago: Object.values(gastosPorTipoPago).map((item) => ({
        ...item,
        total: redondear2(item.total)
      }))
    },
    reservaciones: reservacionesFormateadas,
    ordenes: ordenesFormateadas,
    movimientos_inventario: movimientosFormateados
  };
}

async function reporteFinancieroDia(req, res) {
  try {
    const rango = obtenerRangoDia(req.query.fecha);
    if (!rango) return res.status(400).json({ mensaje: 'fecha inválida. Use YYYY-MM-DD' });

    const reporte = await obtenerResumenFinanciero(rango.inicio, rango.fin);
    return res.json({ mensaje: 'Reporte financiero diario obtenido correctamente', reporte });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al generar reporte financiero diario' });
  }
}

async function reporteFinancieroSemana(req, res) {
  try {
    const rango = obtenerRangoSemana(req.query.fecha);
    if (!rango) return res.status(400).json({ mensaje: 'fecha inválida. Use YYYY-MM-DD' });

    const reporte = await obtenerResumenFinanciero(rango.inicio, rango.fin);
    return res.json({ mensaje: 'Reporte financiero semanal obtenido correctamente', reporte });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al generar reporte financiero semanal' });
  }
}

async function reporteFinancieroMes(req, res) {
  try {
    const rango = obtenerRangoMes(req.query.anio, req.query.mes);
    if (!rango) return res.status(400).json({ mensaje: 'anio o mes inválido' });

    const reporte = await obtenerResumenFinanciero(rango.inicio, rango.fin);
    reporte.anio = rango.anio;
    reporte.mes = rango.mes;

    return res.json({ mensaje: 'Reporte financiero mensual obtenido correctamente', reporte });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al generar reporte financiero mensual' });
  }
}

module.exports = {
  reporteFinancieroDia,
  reporteFinancieroSemana,
  reporteFinancieroMes
};
