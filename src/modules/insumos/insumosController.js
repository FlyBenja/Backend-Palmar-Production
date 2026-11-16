const { Op } = require('sequelize');

const sequelize = require('../../config/database');
const Usuario = require('../../models/Usuario');
const Rol = require('../../models/Rol');
const ProductoInventario = require('../../models/ProductoInventario');
const CategoriaInventario = require('../../models/CategoriaInventario');
const Reservacion = require('../../models/Reservacion');
const Habitacion = require('../../models/Habitacion');
const EstadoReservacion = require('../../models/EstadoReservacion');
const InsumoAsignacion = require('../../models/InsumoAsignacion');
const InsumoConsumo = require('../../models/InsumoConsumo');
const InventarioMovimiento = require('../../models/InventarioMovimiento');
const { fechaHoyGuatemala, fechaSoloDiaISO, obtenerRangoFechasGuatemala } = require('../../utils/dateUtils');

async function obtenerRolInsumos() {
  return Rol.findOne({ where: { nombre: 'Insumos', estado: true } });
}

function usuarioSeguro(usuario) {
  if (!usuario) return null;
  const data = usuario.toJSON ? usuario.toJSON() : usuario;
  return {
    id: data.id,
    rol_id: data.rol_id,
    nombre: data.nombre,
    correo: data.correo,
    telefono: data.telefono,
    estado: data.estado,
    fecha_creacion: data.fecha_creacion,
    fecha_actualizacion: data.fecha_actualizacion,
  };
}

async function productoSeguro(producto) {
  if (!producto) return null;
  const data = producto.toJSON ? producto.toJSON() : producto;
  const categoria = await CategoriaInventario.findByPk(data.categoria_id);
  return {
    id: data.id,
    categoria_id: data.categoria_id,
    categoria: categoria ? { id: categoria.id, nombre: categoria.nombre } : null,
    nombre: data.nombre,
    unidad_medida: data.unidad_medida,
    stock_actual: data.stock_actual,
    stock_minimo: data.stock_minimo,
    costo_unitario: data.costo_unitario,
    estado: data.estado,
  };
}

async function reservacionSegura(reservacion) {
  if (!reservacion) return null;
  const data = reservacion.toJSON ? reservacion.toJSON() : reservacion;
  const habitacion = data.habitacion || await Habitacion.findByPk(data.habitacion_id);
  const estado = data.estado_reservacion || await EstadoReservacion.findByPk(data.estado_reservacion_id);
  const hoy = fechaHoyGuatemala();
  const entrada = fechaSoloDiaISO(data.fecha_entrada);
  const salida = fechaSoloDiaISO(data.fecha_salida);
  let situacion = 'PROXIMA';
  if (entrada && salida && entrada <= hoy && salida >= hoy) situacion = 'VIGENTE';
  if (salida && salida < hoy) situacion = 'FINALIZADA';

  return {
    id: data.id,
    nombre_cliente: data.nombre_cliente,
    nit: data.nit,
    telefono_cliente: data.telefono_cliente,
    fecha_entrada: entrada,
    fecha_salida: salida,
    situacion,
    habitacion: habitacion ? { id: habitacion.id, numero: habitacion.numero, tipo: habitacion.tipo } : null,
    estado: estado ? { id: estado.id, codigo: estado.codigo, nombre: estado.nombre } : null,
  };
}

async function listarUsuariosInsumos(req, res) {
  try {
    const rol = await obtenerRolInsumos();
    if (!rol) return res.json({ usuarios: [] });
    const usuarios = await Usuario.findAll({ where: { rol_id: rol.id }, order: [['nombre', 'ASC']] });
    return res.json({ mensaje: 'Usuarios de insumos obtenidos correctamente', usuarios: usuarios.map(usuarioSeguro) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al listar usuarios de insumos' });
  }
}

async function listarProductosParaAsignar(req, res) {
  try {
    const productos = await ProductoInventario.findAll({ where: { estado: true }, order: [['nombre', 'ASC']] });
    return res.json({
      mensaje: 'Productos disponibles obtenidos correctamente',
      productos: await Promise.all(productos.map(productoSeguro)),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al listar productos disponibles' });
  }
}

async function listarAsignaciones(req, res) {
  try {
    const where = { estado: true };
    if (req.query.usuario_id) where.usuario_id = Number(req.query.usuario_id);
    const asignaciones = await InsumoAsignacion.findAll({ where, order: [['id', 'DESC']] });

    const resultado = await Promise.all(asignaciones.map(async (asignacion) => {
      const usuario = await Usuario.findByPk(asignacion.usuario_id);
      const producto = await ProductoInventario.findByPk(asignacion.producto_inventario_id);
      return {
        id: asignacion.id,
        usuario: usuarioSeguro(usuario),
        producto: await productoSeguro(producto),
        estado: asignacion.estado,
        fecha_creacion: asignacion.fecha_creacion,
      };
    }));

    return res.json({ mensaje: 'Asignaciones obtenidas correctamente', asignaciones: resultado });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al listar asignaciones' });
  }
}

async function asignarProducto(req, res) {
  try {
    const { usuario_id, producto_inventario_id } = req.body;
    if (!usuario_id || !producto_inventario_id) {
      return res.status(400).json({ mensaje: 'usuario_id y producto_inventario_id son obligatorios' });
    }

    const rol = await obtenerRolInsumos();
    const usuario = rol ? await Usuario.findOne({ where: { id: usuario_id, rol_id: rol.id, estado: true } }) : null;
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario de insumos no encontrado o inactivo' });

    const producto = await ProductoInventario.findOne({ where: { id: producto_inventario_id, estado: true } });
    if (!producto) return res.status(404).json({ mensaje: 'Producto de inventario no encontrado o inactivo' });

    let asignacion = await InsumoAsignacion.findOne({ where: { usuario_id, producto_inventario_id } });
    if (asignacion) {
      asignacion.estado = true;
      asignacion.asignado_por_usuario_id = Number(req.usuario.id) || null;
      asignacion.fecha_actualizacion = new Date();
      await asignacion.save();
    } else {
      asignacion = await InsumoAsignacion.create({
        usuario_id,
        producto_inventario_id,
        asignado_por_usuario_id: Number(req.usuario.id) || null,
        estado: true,
        fecha_creacion: new Date(),
        fecha_actualizacion: null,
      });
    }

    return res.status(201).json({
      mensaje: 'Producto asignado correctamente',
      asignacion: { id: asignacion.id, usuario: usuarioSeguro(usuario), producto: await productoSeguro(producto) },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al asignar producto' });
  }
}

async function quitarAsignacion(req, res) {
  try {
    const asignacion = await InsumoAsignacion.findByPk(req.params.id);
    if (!asignacion) return res.status(404).json({ mensaje: 'Asignación no encontrada' });
    asignacion.estado = false;
    asignacion.fecha_actualizacion = new Date();
    await asignacion.save();
    return res.json({ mensaje: 'Asignación desactivada correctamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al quitar asignación' });
  }
}

async function listarMisProductos(req, res) {
  try {
    const asignaciones = await InsumoAsignacion.findAll({
      where: { usuario_id: Number(req.usuario.id), estado: true },
      order: [['id', 'ASC']],
    });
    const productos = [];
    for (const asignacion of asignaciones) {
      const producto = await ProductoInventario.findOne({ where: { id: asignacion.producto_inventario_id, estado: true } });
      if (producto) productos.push(await productoSeguro(producto));
    }
    return res.json({ mensaje: 'Productos asignados obtenidos correctamente', productos });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al listar productos asignados' });
  }
}

async function listarReservacionesDisponibles(req, res) {
  try {
    const estados = await EstadoReservacion.findAll({ where: { codigo: { [Op.in]: ['CONFIRMADA', 'PAGADA'] }, estado: true } });
    const ids = estados.map((e) => e.id);
    if (ids.length === 0) return res.json({ mensaje: 'No hay estados de reservación configurados', reservaciones: [] });
    const reservaciones = await Reservacion.findAll({
      where: { estado_reservacion_id: { [Op.in]: ids } },
      include: [
        { model: Habitacion, as: 'habitacion', attributes: ['id', 'numero', 'tipo'] },
        { model: EstadoReservacion, as: 'estado_reservacion', attributes: ['id', 'codigo', 'nombre'] },
      ],
      order: [['fecha_entrada', 'ASC'], ['id', 'ASC']],
    });
    const hoy = fechaHoyGuatemala();
    const vigentes = reservaciones.filter((r) => {
      const salida = fechaSoloDiaISO(r.fecha_salida);
      return !salida || salida >= hoy;
    });
    return res.json({
      mensaje: 'Reservaciones disponibles obtenidas correctamente',
      reservaciones: await Promise.all(vigentes.map(reservacionSegura)),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al listar reservaciones para insumos' });
  }
}

async function registrarConsumos(req, res) {
  const transaction = await sequelize.transaction();
  try {
    const { reservacion_id, items, observacion } = req.body;
    if (!reservacion_id || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ mensaje: 'reservacion_id e items son obligatorios' });
    }

    const reservacion = await Reservacion.findByPk(reservacion_id, { transaction });
    if (!reservacion) {
      await transaction.rollback();
      return res.status(404).json({ mensaje: 'La reservación indicada no existe' });
    }

    const estado = await EstadoReservacion.findByPk(reservacion.estado_reservacion_id, { transaction });
    if (!estado || !['CONFIRMADA', 'PAGADA'].includes(estado.codigo)) {
      await transaction.rollback();
      return res.status(400).json({ mensaje: 'La reservación no está disponible para registrar insumos' });
    }

    const cantidadesPorProducto = new Map();
    for (const item of items) {
      const productoId = Number(item.producto_inventario_id);
      const cantidad = Number(item.cantidad);
      if (!productoId || !Number.isFinite(cantidad) || cantidad <= 0) continue;
      cantidadesPorProducto.set(productoId, (cantidadesPorProducto.get(productoId) || 0) + cantidad);
    }
    if (cantidadesPorProducto.size === 0) {
      await transaction.rollback();
      return res.status(400).json({ mensaje: 'Debe ingresar al menos una cantidad mayor a 0' });
    }

    const usuarioId = Number(req.usuario.id);
    const consumos = [];

    for (const [productoId, cantidad] of cantidadesPorProducto.entries()) {
      const asignacion = await InsumoAsignacion.findOne({
        where: { usuario_id: usuarioId, producto_inventario_id: productoId, estado: true },
        transaction,
      });
      if (!asignacion) {
        throw Object.assign(new Error('PRODUCTO_NO_ASIGNADO'), { status: 403, productoId });
      }

      const producto = await ProductoInventario.findByPk(productoId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!producto || !producto.estado) {
        throw Object.assign(new Error('PRODUCTO_NO_DISPONIBLE'), { status: 404, productoId });
      }

      const stockAnterior = Number(producto.stock_actual || 0);
      const stockNuevo = stockAnterior - cantidad;
      if (stockNuevo < 0) {
        throw Object.assign(new Error('STOCK_INSUFICIENTE'), { status: 400, producto, cantidad });
      }

      producto.stock_actual = stockNuevo;
      producto.fecha_actualizacion = new Date();
      await producto.save({ transaction });

      const movimiento = await InventarioMovimiento.create({
        producto_inventario_id: producto.id,
        tipo_movimiento: 'SALIDA',
        cantidad,
        stock_anterior: stockAnterior,
        stock_nuevo: stockNuevo,
        costo_unitario: Number(producto.costo_unitario || 0),
        tipo_pago_id: null,
        referencia_tipo: 'INSUMO_RESERVACION',
        referencia_id: reservacion.id,
        observacion: observacion || `Insumos entregados a reservación #${reservacion.id}`,
        usuario_id: usuarioId,
        fecha_movimiento: new Date(),
      }, { transaction });

      const consumo = await InsumoConsumo.create({
        reservacion_id: reservacion.id,
        producto_inventario_id: producto.id,
        usuario_id: usuarioId,
        inventario_movimiento_id: movimiento.id,
        cantidad,
        stock_anterior: stockAnterior,
        stock_nuevo: stockNuevo,
        observacion: observacion || null,
        fecha_consumo: new Date(),
      }, { transaction });

      consumos.push({
        id: consumo.id,
        producto: { id: producto.id, nombre: producto.nombre, unidad_medida: producto.unidad_medida },
        cantidad,
        stock_anterior: stockAnterior,
        stock_nuevo: stockNuevo,
      });
    }

    await transaction.commit();
    return res.status(201).json({
      mensaje: 'Insumos descontados correctamente',
      reservacion_id: Number(reservacion_id),
      consumos,
    });
  } catch (error) {
    if (!transaction.finished) await transaction.rollback();
    console.error(error);
    if (error.message === 'PRODUCTO_NO_ASIGNADO') return res.status(403).json({ mensaje: 'Intentó descontar un producto que no tiene asignado' });
    if (error.message === 'PRODUCTO_NO_DISPONIBLE') return res.status(404).json({ mensaje: 'Uno de los productos ya no está disponible' });
    if (error.message === 'STOCK_INSUFICIENTE') return res.status(400).json({ mensaje: `Stock insuficiente para ${error.producto?.nombre || 'el producto seleccionado'}` });
    return res.status(error.status || 500).json({ mensaje: 'Error al registrar consumo de insumos' });
  }
}

async function formatearConsumo(consumo) {
  const usuario = consumo.usuario_id ? await Usuario.findByPk(consumo.usuario_id) : null;
  const producto = await ProductoInventario.findByPk(consumo.producto_inventario_id);
  const reservacion = await Reservacion.findByPk(consumo.reservacion_id, {
    include: [
      { model: Habitacion, as: 'habitacion', attributes: ['id', 'numero', 'tipo'] },
      { model: EstadoReservacion, as: 'estado_reservacion', attributes: ['id', 'codigo', 'nombre'] },
    ],
  });
  return {
    id: consumo.id,
    cantidad: consumo.cantidad,
    stock_anterior: consumo.stock_anterior,
    stock_nuevo: consumo.stock_nuevo,
    observacion: consumo.observacion,
    fecha_consumo: consumo.fecha_consumo,
    usuario: usuarioSeguro(usuario),
    producto: await productoSeguro(producto),
    reservacion: await reservacionSegura(reservacion),
  };
}

async function listarHistorial(req, res) {
  try {
    const where = {};
    if (req.query.usuario_id) where.usuario_id = Number(req.query.usuario_id);
    if (req.query.producto_inventario_id) where.producto_inventario_id = Number(req.query.producto_inventario_id);
    if (req.query.desde || req.query.hasta) {
      const rango = obtenerRangoFechasGuatemala(req.query.desde, req.query.hasta);
      if (!rango) return res.status(400).json({ mensaje: 'Rango de fechas inválido' });
      where.fecha_consumo = { [Op.between]: [rango.inicio, rango.fin] };
    }

    const consumos = await InsumoConsumo.findAll({
      where,
      order: [['fecha_consumo', 'DESC'], ['id', 'DESC']],
      limit: 300,
    });

    const historial = await Promise.all(consumos.map(formatearConsumo));
    const totalUnidades = historial.reduce((total, item) => total + Number(item.cantidad || 0), 0);
    return res.json({
      mensaje: 'Historial de insumos obtenido correctamente',
      resumen: { registros: historial.length, unidades: totalUnidades },
      historial,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al listar historial de insumos' });
  }
}

async function listarMiHistorial(req, res) {
  req.query.usuario_id = Number(req.usuario.id);
  return listarHistorial(req, res);
}

module.exports = {
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
};
