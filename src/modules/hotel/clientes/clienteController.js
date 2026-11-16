const Reservacion = require('../../../models/Reservacion');
const Habitacion = require('../../../models/Habitacion');
const Tarifa = require('../../../models/Tarifa');
const EstadoReservacion = require('../../../models/EstadoReservacion');
const TipoPago = require('../../../models/TipoPago');
const { fechaSoloDiaISO } = require('../../../utils/dateUtils');

function normalizarTexto(valor) {
  return String(valor || '').trim();
}

function normalizarNit(valor) {
  return normalizarTexto(valor).replace(/\s+/g, '').toUpperCase();
}

function normalizarTelefono(valor) {
  return normalizarTexto(valor).replace(/\D/g, '');
}

function claveCliente(reservacion) {
  const nit = normalizarNit(reservacion.nit);
  if (nit && nit !== 'CF' && nit !== 'C/F') return `NIT:${nit}`;

  const telefono = normalizarTelefono(reservacion.telefono_cliente);
  if (telefono) return `TEL:${telefono}`;

  return `NOMBRE:${normalizarTexto(reservacion.nombre_cliente).toLowerCase()}`;
}

function datosClienteMasRecientes(reservaciones) {
  const ordenadas = [...reservaciones].sort(
    (a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
  );

  const nombre = ordenadas.find((item) => normalizarTexto(item.nombre_cliente))?.nombre_cliente || 'Sin nombre';
  const nit = ordenadas.find((item) => normalizarTexto(item.nit))?.nit || null;
  const telefono = ordenadas.find((item) => normalizarTexto(item.telefono_cliente))?.telefono_cliente || null;

  return { nombre, nit, telefono };
}

async function obtenerReservacionesClientes() {
  return Reservacion.findAll({
    include: [
      {
        model: EstadoReservacion,
        as: 'estado_reservacion',
        attributes: ['id', 'codigo', 'nombre']
      },
      {
        model: Habitacion,
        as: 'habitacion',
        attributes: ['id', 'numero', 'tipo']
      },
      {
        model: Tarifa,
        as: 'tarifa',
        attributes: ['id', 'nombre', 'precio']
      },
      {
        model: TipoPago,
        as: 'tipo_pago',
        attributes: ['id', 'codigo', 'nombre']
      }
    ],
    order: [['fecha_entrada', 'DESC'], ['id', 'DESC']]
  });
}

function agruparClientes(reservaciones) {
  const grupos = new Map();

  for (const reservacion of reservaciones) {
    const key = claveCliente(reservacion);
    if (!grupos.has(key)) grupos.set(key, []);
    grupos.get(key).push(reservacion);
  }

  return grupos;
}

function construirResumen(grupo) {
  const { nombre, nit, telefono } = datosClienteMasRecientes(grupo);
  const pagadas = grupo.filter((item) => item.estado_reservacion?.codigo === 'PAGADA');
  const confirmadas = grupo.filter((item) => item.estado_reservacion?.codigo === 'CONFIRMADA');

  const primera = [...grupo].sort(
    (a, b) => new Date(a.fecha_entrada).getTime() - new Date(b.fecha_entrada).getTime()
  )[0];

  const ultimaPagada = [...pagadas].sort(
    (a, b) => new Date(b.fecha_salida).getTime() - new Date(a.fecha_salida).getTime()
  )[0];

  const hoy = new Date();
  const proxima = [...confirmadas]
    .filter((item) => new Date(item.fecha_salida).getTime() >= hoy.getTime())
    .sort((a, b) => new Date(a.fecha_entrada).getTime() - new Date(b.fecha_entrada).getTime())[0];

  return {
    referencia_reservacion_id: grupo[0].id,
    nombre,
    nit,
    telefono,
    total_reservaciones: grupo.length,
    total_hospedajes: pagadas.length,
    total_pagado: pagadas.reduce((total, item) => total + Number(item.precio_pagado || 0), 0),
    primera_reservacion: primera ? fechaSoloDiaISO(primera.fecha_entrada) : null,
    ultima_estadia: ultimaPagada ? fechaSoloDiaISO(ultimaPagada.fecha_salida) : null,
    proxima_reservacion: proxima ? fechaSoloDiaISO(proxima.fecha_entrada) : null
  };
}

function construirHistorial(reservacion) {
  return {
    id: reservacion.id,
    fecha_entrada: fechaSoloDiaISO(reservacion.fecha_entrada),
    fecha_salida: fechaSoloDiaISO(reservacion.fecha_salida),
    dias: reservacion.dias,
    estado: reservacion.estado_reservacion
      ? {
          codigo: reservacion.estado_reservacion.codigo,
          nombre: reservacion.estado_reservacion.nombre
        }
      : null,
    habitacion: reservacion.habitacion
      ? {
          id: reservacion.habitacion.id,
          numero: reservacion.habitacion.numero,
          tipo: reservacion.habitacion.tipo
        }
      : null,
    tarifa: reservacion.tarifa
      ? {
          id: reservacion.tarifa.id,
          nombre: reservacion.tarifa.nombre,
          precio: reservacion.tarifa.precio
        }
      : null,
    total_reservacion: reservacion.total_reservacion,
    precio_pagado: reservacion.precio_pagado,
    tipo_pago: reservacion.tipo_pago
      ? {
          id: reservacion.tipo_pago.id,
          codigo: reservacion.tipo_pago.codigo,
          nombre: reservacion.tipo_pago.nombre
        }
      : null,
    fecha_creacion: reservacion.fecha_creacion
  };
}

async function listarClientes(req, res) {
  try {
    const reservaciones = await obtenerReservacionesClientes();
    const grupos = agruparClientes(reservaciones);

    const clientes = Array.from(grupos.values())
      .map(construirResumen)
      .sort((a, b) => {
        const fechaA = a.ultima_estadia || a.proxima_reservacion || a.primera_reservacion || '';
        const fechaB = b.ultima_estadia || b.proxima_reservacion || b.primera_reservacion || '';
        return fechaB.localeCompare(fechaA);
      });

    return res.json({
      mensaje: 'Clientes obtenidos correctamente',
      clientes
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al listar clientes' });
  }
}

async function obtenerCliente(req, res) {
  try {
    const referencia = await Reservacion.findByPk(req.params.reservacionId);

    if (!referencia) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    const reservaciones = await obtenerReservacionesClientes();
    const key = claveCliente(referencia);
    const grupo = reservaciones.filter((item) => claveCliente(item) === key);

    if (grupo.length === 0) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    const resumen = construirResumen(grupo);
    const historial = grupo
      .map(construirHistorial)
      .sort((a, b) => b.fecha_entrada.localeCompare(a.fecha_entrada));

    return res.json({
      mensaje: 'Detalle de cliente obtenido correctamente',
      cliente: {
        ...resumen,
        historial
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al obtener detalle del cliente' });
  }
}

module.exports = {
  listarClientes,
  obtenerCliente
};
