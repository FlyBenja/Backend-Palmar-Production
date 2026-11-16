const { Op } = require('sequelize');

const sequelize = require('../../config/database');
const Usuario = require('../../models/Usuario');
const Rol = require('../../models/Rol');
const ProductoInventario = require('../../models/ProductoInventario');
const CategoriaInventario = require('../../models/CategoriaInventario');
const InsumoCocinaAsignacion = require('../../models/InsumoCocinaAsignacion');
const InsumoCocinaConsumo = require('../../models/InsumoCocinaConsumo');
const InventarioMovimiento = require('../../models/InventarioMovimiento');
const { obtenerRangoFechasGuatemala } = require('../../utils/dateUtils');

async function obtenerRolInsumosCocina() {
  return Rol.findOne({ where: { nombre: 'Insumos Cocina', estado: true } });
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

async function listarUsuarios(req, res) {
  try {
    const rol = await obtenerRolInsumosCocina();
    if (!rol) return res.json({ usuarios: [] });
    const usuarios = await Usuario.findAll({ where: { rol_id: rol.id }, order: [['nombre', 'ASC']] });
    return res.json({ mensaje: 'Usuarios de insumos de cocina obtenidos correctamente', usuarios: usuarios.map(usuarioSeguro) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al listar usuarios de insumos de cocina' });
  }
}

async function listarProductosParaAsignar(req, res) {
  try {
    const where = { estado: true };
    if (req.query.categoria_id) where.categoria_id = Number(req.query.categoria_id);
    const productos = await ProductoInventario.findAll({ where, order: [['nombre', 'ASC']] });
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
    const asignaciones = await InsumoCocinaAsignacion.findAll({ where, order: [['id', 'DESC']] });
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
    return res.status(500).json({ mensaje: 'Error al listar asignaciones de cocina' });
  }
}

async function asignarProducto(req, res) {
  try {
    const { usuario_id, producto_inventario_id } = req.body;
    if (!usuario_id || !producto_inventario_id) {
      return res.status(400).json({ mensaje: 'usuario_id y producto_inventario_id son obligatorios' });
    }

    const rol = await obtenerRolInsumosCocina();
    const usuario = rol ? await Usuario.findOne({ where: { id: usuario_id, rol_id: rol.id, estado: true } }) : null;
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario de insumos de cocina no encontrado o inactivo' });

    const producto = await ProductoInventario.findOne({ where: { id: producto_inventario_id, estado: true } });
    if (!producto) return res.status(404).json({ mensaje: 'Producto de inventario no encontrado o inactivo' });

    let asignacion = await InsumoCocinaAsignacion.findOne({ where: { usuario_id, producto_inventario_id } });
    if (asignacion) {
      asignacion.estado = true;
      asignacion.asignado_por_usuario_id = Number(req.usuario.id) || null;
      asignacion.fecha_actualizacion = new Date();
      await asignacion.save();
    } else {
      asignacion = await InsumoCocinaAsignacion.create({
        usuario_id,
        producto_inventario_id,
        asignado_por_usuario_id: Number(req.usuario.id) || null,
        estado: true,
        fecha_creacion: new Date(),
        fecha_actualizacion: null,
      });
    }

    return res.status(201).json({
      mensaje: 'Producto asignado al usuario de cocina correctamente',
      asignacion: { id: asignacion.id, usuario: usuarioSeguro(usuario), producto: await productoSeguro(producto) },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al asignar producto de cocina' });
  }
}

async function quitarAsignacion(req, res) {
  try {
    const asignacion = await InsumoCocinaAsignacion.findByPk(req.params.id);
    if (!asignacion) return res.status(404).json({ mensaje: 'Asignación no encontrada' });
    asignacion.estado = false;
    asignacion.fecha_actualizacion = new Date();
    await asignacion.save();
    return res.json({ mensaje: 'Asignación desactivada correctamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al quitar asignación de cocina' });
  }
}

async function listarMisProductos(req, res) {
  try {
    const asignaciones = await InsumoCocinaAsignacion.findAll({
      where: { usuario_id: Number(req.usuario.id), estado: true },
      order: [['id', 'ASC']],
    });
    const productos = [];
    for (const asignacion of asignaciones) {
      const producto = await ProductoInventario.findOne({ where: { id: asignacion.producto_inventario_id, estado: true } });
      if (producto) productos.push(await productoSeguro(producto));
    }
    return res.json({ mensaje: 'Productos de cocina asignados obtenidos correctamente', productos });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al listar productos asignados de cocina' });
  }
}

async function registrarConsumos(req, res) {
  const transaction = await sequelize.transaction();
  try {
    const { items, destino, observacion } = req.body;
    const destinoLimpio = String(destino || '').trim();
    if (!destinoLimpio || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ mensaje: 'destino e items son obligatorios' });
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
      const asignacion = await InsumoCocinaAsignacion.findOne({
        where: { usuario_id: usuarioId, producto_inventario_id: productoId, estado: true },
        transaction,
      });
      if (!asignacion) throw Object.assign(new Error('PRODUCTO_NO_ASIGNADO'), { status: 403 });

      const producto = await ProductoInventario.findByPk(productoId, { transaction, lock: transaction.LOCK.UPDATE });
      if (!producto || !producto.estado) throw Object.assign(new Error('PRODUCTO_NO_DISPONIBLE'), { status: 404 });

      const stockAnterior = Number(producto.stock_actual || 0);
      const stockNuevo = stockAnterior - cantidad;
      if (stockNuevo < 0) throw Object.assign(new Error('STOCK_INSUFICIENTE'), { status: 400, producto });

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
        referencia_tipo: 'INSUMO_COCINA',
        referencia_id: null,
        observacion: observacion || `Salida a cocina: ${destinoLimpio}`,
        usuario_id: usuarioId,
        fecha_movimiento: new Date(),
      }, { transaction });

      const consumo = await InsumoCocinaConsumo.create({
        producto_inventario_id: producto.id,
        usuario_id: usuarioId,
        inventario_movimiento_id: movimiento.id,
        cantidad,
        stock_anterior: stockAnterior,
        stock_nuevo: stockNuevo,
        destino: destinoLimpio,
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
    return res.status(201).json({ mensaje: 'Insumos de cocina descontados correctamente', destino: destinoLimpio, consumos });
  } catch (error) {
    if (!transaction.finished) await transaction.rollback();
    console.error(error);
    if (error.message === 'PRODUCTO_NO_ASIGNADO') return res.status(403).json({ mensaje: 'Intentó descontar un producto que no tiene asignado' });
    if (error.message === 'PRODUCTO_NO_DISPONIBLE') return res.status(404).json({ mensaje: 'Uno de los productos ya no está disponible' });
    if (error.message === 'STOCK_INSUFICIENTE') return res.status(400).json({ mensaje: `Stock insuficiente para ${error.producto?.nombre || 'el producto seleccionado'}` });
    return res.status(error.status || 500).json({ mensaje: 'Error al registrar consumo de insumos de cocina' });
  }
}

async function formatearConsumo(consumo) {
  const usuario = consumo.usuario_id ? await Usuario.findByPk(consumo.usuario_id) : null;
  const producto = await ProductoInventario.findByPk(consumo.producto_inventario_id);
  return {
    id: consumo.id,
    cantidad: consumo.cantidad,
    stock_anterior: consumo.stock_anterior,
    stock_nuevo: consumo.stock_nuevo,
    destino: consumo.destino,
    observacion: consumo.observacion,
    fecha_consumo: consumo.fecha_consumo,
    usuario: usuarioSeguro(usuario),
    producto: await productoSeguro(producto),
  };
}

async function listarHistorial(req, res) {
  try {
    const where = {};
    if (req.query.usuario_id) where.usuario_id = Number(req.query.usuario_id);
    if (req.query.producto_inventario_id) where.producto_inventario_id = Number(req.query.producto_inventario_id);
    if (req.query.destino) where.destino = { [Op.like]: `%${String(req.query.destino).trim()}%` };
    if (req.query.desde || req.query.hasta) {
      const rango = obtenerRangoFechasGuatemala(req.query.desde, req.query.hasta);
      if (!rango) return res.status(400).json({ mensaje: 'Rango de fechas inválido' });
      where.fecha_consumo = { [Op.between]: [rango.inicio, rango.fin] };
    }

    const consumos = await InsumoCocinaConsumo.findAll({ where, order: [['fecha_consumo', 'DESC'], ['id', 'DESC']], limit: 300 });
    const historial = await Promise.all(consumos.map(formatearConsumo));
    const totalUnidades = historial.reduce((total, item) => total + Number(item.cantidad || 0), 0);
    return res.json({
      mensaje: 'Historial de insumos de cocina obtenido correctamente',
      resumen: { registros: historial.length, unidades: totalUnidades },
      historial,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al listar historial de insumos de cocina' });
  }
}

async function listarMiHistorial(req, res) {
  req.query.usuario_id = Number(req.usuario.id);
  return listarHistorial(req, res);
}

module.exports = {
  listarUsuarios,
  listarProductosParaAsignar,
  listarAsignaciones,
  asignarProducto,
  quitarAsignacion,
  listarMisProductos,
  registrarConsumos,
  listarHistorial,
  listarMiHistorial,
};
