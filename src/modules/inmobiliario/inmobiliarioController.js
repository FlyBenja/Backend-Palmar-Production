const { Op } = require('sequelize');
const sequelize = require('../../config/database');
const CategoriaInmobiliario = require('../../models/CategoriaInmobiliario');
const ProductoInmobiliario = require('../../models/ProductoInmobiliario');
const InmobiliarioMovimiento = require('../../models/InmobiliarioMovimiento');


function parsearBooleano(valor, valorDefecto = true) {
  if (valor === undefined || valor === null || valor === '') return valorDefecto;
  if (typeof valor === 'boolean') return valor;
  const normalizado = String(valor).trim().toLowerCase();
  if (['true', '1', 'si', 'sí'].includes(normalizado)) return true;
  if (['false', '0', 'no'].includes(normalizado)) return false;
  return valorDefecto;
}

function obtenerUsuarioId(req) {
  return req.usuario ? Number(req.usuario.id || req.usuario.usuario_id || 0) || null : null;
}

function formatearCategoria(categoria) {
  const data = categoria.toJSON ? categoria.toJSON() : categoria;
  return {
    id: data.id,
    nombre: data.nombre,
    descripcion: data.descripcion,
    estado: Boolean(data.estado),
    fecha_creacion: data.fecha_creacion,
    fecha_actualizacion: data.fecha_actualizacion,
  };
}

async function formatearProducto(producto) {
  const data = producto.toJSON ? producto.toJSON() : producto;
  const categoria = await CategoriaInmobiliario.findByPk(data.categoria_id);
  return {
    id: data.id,
    categoria_id: data.categoria_id,
    categoria: categoria ? formatearCategoria(categoria) : null,
    nombre: data.nombre,
    descripcion: data.descripcion,
    cantidad_actual: data.cantidad_actual,
    estado: Boolean(data.estado),
    fecha_creacion: data.fecha_creacion,
    fecha_actualizacion: data.fecha_actualizacion,
  };
}

async function formatearMovimiento(movimiento) {
  const data = movimiento.toJSON ? movimiento.toJSON() : movimiento;
  const producto = await ProductoInmobiliario.findByPk(data.producto_inmobiliario_id);
  return {
    id: data.id,
    producto_inmobiliario_id: data.producto_inmobiliario_id,
    producto: producto ? await formatearProducto(producto) : null,
    tipo_movimiento: data.tipo_movimiento,
    cantidad: data.cantidad,
    cantidad_anterior: data.cantidad_anterior,
    cantidad_nueva: data.cantidad_nueva,
    observacion: data.observacion,
    usuario_id: data.usuario_id,
    fecha_movimiento: data.fecha_movimiento,
  };
}

async function listarCategorias(req, res) {
  try {
    const categorias = await CategoriaInmobiliario.findAll({ order: [['nombre', 'ASC'], ['id', 'ASC']] });
    return res.json({ mensaje: 'Categorías de inmobiliario obtenidas correctamente', categorias: categorias.map(formatearCategoria) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al listar categorías de inmobiliario' });
  }
}

async function crearCategoria(req, res) {
  try {
    const nombre = String(req.body.nombre || '').trim();
    const descripcion = String(req.body.descripcion || '').trim();
    if (!nombre) return res.status(400).json({ mensaje: 'nombre es obligatorio' });

    const existe = await CategoriaInmobiliario.findOne({ where: { nombre } });
    if (existe) return res.status(409).json({ mensaje: 'Ya existe una categoría con ese nombre' });

    const categoria = await CategoriaInmobiliario.create({
      nombre,
      descripcion: descripcion || null,
      estado: true,
      fecha_creacion: new Date(),
      fecha_actualizacion: null,
    });
    return res.status(201).json({ mensaje: 'Categoría creada correctamente', categoria: formatearCategoria(categoria) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al crear categoría de inmobiliario' });
  }
}

async function editarCategoria(req, res) {
  try {
    const categoria = await CategoriaInmobiliario.findByPk(req.params.id);
    if (!categoria) return res.status(404).json({ mensaje: 'Categoría no encontrada' });

    if (req.body.nombre !== undefined) {
      const nombre = String(req.body.nombre || '').trim();
      if (!nombre) return res.status(400).json({ mensaje: 'nombre no puede quedar vacío' });
      const existe = await CategoriaInmobiliario.findOne({ where: { nombre, id: { [Op.ne]: categoria.id } } });
      if (existe) return res.status(409).json({ mensaje: 'Ya existe otra categoría con ese nombre' });
      categoria.nombre = nombre;
    }
    if (req.body.descripcion !== undefined) categoria.descripcion = String(req.body.descripcion || '').trim() || null;
    if (req.body.estado !== undefined) categoria.estado = parsearBooleano(req.body.estado, categoria.estado);
    categoria.fecha_actualizacion = new Date();
    await categoria.save();
    return res.json({ mensaje: 'Categoría actualizada correctamente', categoria: formatearCategoria(categoria) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al actualizar categoría de inmobiliario' });
  }
}

async function listarProductos(req, res) {
  try {
    const where = {};
    if (req.query.categoria_id) where.categoria_id = req.query.categoria_id;
    const productos = await ProductoInmobiliario.findAll({ where, order: [['nombre', 'ASC'], ['id', 'ASC']] });
    return res.json({ mensaje: 'Productos de inmobiliario obtenidos correctamente', productos: await Promise.all(productos.map(formatearProducto)) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al listar productos de inmobiliario' });
  }
}

async function crearProducto(req, res) {
  try {
    const categoriaId = Number(req.body.categoria_id);
    const nombre = String(req.body.nombre || '').trim();
    const descripcion = String(req.body.descripcion || '').trim();
    const cantidadInicial = Number(req.body.cantidad_actual || 0);
    if (!categoriaId || !nombre) return res.status(400).json({ mensaje: 'categoria_id y nombre son obligatorios' });
    if (!Number.isFinite(cantidadInicial) || cantidadInicial < 0) return res.status(400).json({ mensaje: 'cantidad_actual debe ser mayor o igual a 0' });

    const categoria = await CategoriaInmobiliario.findOne({ where: { id: categoriaId, estado: true } });
    if (!categoria) return res.status(404).json({ mensaje: 'Categoría no encontrada o inactiva' });

    const producto = await ProductoInmobiliario.create({
      categoria_id: categoriaId,
      nombre,
      descripcion: descripcion || null,
      cantidad_actual: cantidadInicial,
      estado: true,
      fecha_creacion: new Date(),
      fecha_actualizacion: null,
    });

    let movimiento = null;
    if (cantidadInicial > 0) {
      movimiento = await InmobiliarioMovimiento.create({
        producto_inmobiliario_id: producto.id,
        tipo_movimiento: 'ENTRADA',
        cantidad: cantidadInicial,
        cantidad_anterior: 0,
        cantidad_nueva: cantidadInicial,
        observacion: 'Cantidad inicial al crear producto',
        usuario_id: obtenerUsuarioId(req),
        fecha_movimiento: new Date(),
      });
    }

    return res.status(201).json({
      mensaje: 'Producto de inmobiliario creado correctamente',
      producto: await formatearProducto(producto),
      movimiento: movimiento ? await formatearMovimiento(movimiento) : null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al crear producto de inmobiliario' });
  }
}

async function editarProducto(req, res) {
  try {
    const producto = await ProductoInmobiliario.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    if (req.body.categoria_id !== undefined) {
      const categoria = await CategoriaInmobiliario.findOne({ where: { id: req.body.categoria_id, estado: true } });
      if (!categoria) return res.status(404).json({ mensaje: 'Categoría no encontrada o inactiva' });
      producto.categoria_id = req.body.categoria_id;
    }
    if (req.body.nombre !== undefined) {
      const nombre = String(req.body.nombre || '').trim();
      if (!nombre) return res.status(400).json({ mensaje: 'nombre no puede quedar vacío' });
      producto.nombre = nombre;
    }
    if (req.body.descripcion !== undefined) producto.descripcion = String(req.body.descripcion || '').trim() || null;
    if (req.body.estado !== undefined) producto.estado = parsearBooleano(req.body.estado, producto.estado);
    producto.fecha_actualizacion = new Date();
    await producto.save();
    return res.json({ mensaje: 'Producto actualizado correctamente', producto: await formatearProducto(producto) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al actualizar producto de inmobiliario' });
  }
}

async function crearMovimiento(req, res) {
  const transaction = await sequelize.transaction();

  try {
    const productoId = Number(req.body.producto_inmobiliario_id);
    const tipo = String(req.body.tipo_movimiento || '').toUpperCase();
    const cantidad = Number(req.body.cantidad);
    const observacion = String(req.body.observacion || '').trim();
    if (!productoId || !['ENTRADA', 'SALIDA'].includes(tipo) || !Number.isFinite(cantidad) || cantidad <= 0) {
      await transaction.rollback();
      return res.status(400).json({ mensaje: 'producto_inmobiliario_id, tipo_movimiento y una cantidad mayor a 0 son obligatorios' });
    }

    const producto = await ProductoInmobiliario.findByPk(productoId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!producto) {
      await transaction.rollback();
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    const anterior = Number(producto.cantidad_actual || 0);
    const nueva = tipo === 'ENTRADA' ? anterior + cantidad : anterior - cantidad;
    if (nueva < 0) {
      await transaction.rollback();
      return res.status(400).json({ mensaje: 'La salida no puede dejar la cantidad en negativo' });
    }

    producto.cantidad_actual = nueva;
    producto.fecha_actualizacion = new Date();
    await producto.save({ transaction });

    const movimiento = await InmobiliarioMovimiento.create({
      producto_inmobiliario_id: producto.id,
      tipo_movimiento: tipo,
      cantidad,
      cantidad_anterior: anterior,
      cantidad_nueva: nueva,
      observacion: observacion || null,
      usuario_id: obtenerUsuarioId(req),
      fecha_movimiento: new Date(),
    }, { transaction });

    await transaction.commit();

    return res.status(201).json({
      mensaje: 'Movimiento registrado correctamente',
      movimiento: await formatearMovimiento(movimiento),
      producto: await formatearProducto(producto),
    });
  } catch (error) {
    if (!transaction.finished) await transaction.rollback();
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al registrar movimiento de inmobiliario' });
  }
}

async function listarMovimientos(req, res) {
  try {
    const where = {};
    if (req.query.producto_inmobiliario_id) where.producto_inmobiliario_id = req.query.producto_inmobiliario_id;
    const movimientos = await InmobiliarioMovimiento.findAll({
      where,
      order: [['fecha_movimiento', 'DESC'], ['id', 'DESC']],
      limit: 100,
    });
    return res.json({ mensaje: 'Movimientos obtenidos correctamente', movimientos: await Promise.all(movimientos.map(formatearMovimiento)) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al listar movimientos de inmobiliario' });
  }
}

module.exports = {
  listarCategorias,
  crearCategoria,
  editarCategoria,
  listarProductos,
  crearProducto,
  editarProducto,
  crearMovimiento,
  listarMovimientos,
};
