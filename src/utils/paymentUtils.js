function numero(valor) {
  return Number(valor || 0);
}

function redondear2(valor) {
  return Math.round(numero(valor) * 100) / 100;
}

function calcularDetalleEfectivo(tipoPago, efectivoRecibido, totalCobrado) {
  const total = redondear2(totalCobrado);

  if (!tipoPago || String(tipoPago.codigo || '').toUpperCase() !== 'EFECTIVO') {
    return {
      efectivo_recibido: null,
      cambio_devuelto: null,
    };
  }

  const recibido = Number(efectivoRecibido);

  if (efectivoRecibido === undefined || efectivoRecibido === null || efectivoRecibido === '' || !Number.isFinite(recibido)) {
    const error = new Error('efectivo_recibido es obligatorio para pagos en efectivo');
    error.status = 400;
    throw error;
  }

  const recibidoRedondeado = redondear2(recibido);

  if (recibidoRedondeado < total) {
    const error = new Error(`Efectivo insuficiente. Faltan Q${redondear2(total - recibidoRedondeado).toFixed(2)}`);
    error.status = 400;
    throw error;
  }

  return {
    efectivo_recibido: recibidoRedondeado,
    cambio_devuelto: redondear2(recibidoRedondeado - total),
  };
}

module.exports = {
  numero,
  redondear2,
  calcularDetalleEfectivo,
};
