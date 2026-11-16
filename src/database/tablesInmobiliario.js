const { DataTypes } = require('sequelize');
const { crearTablaSiNoExiste } = require('./tableHelpers');

async function crearTablasInmobiliario() {
  await crearTablaSiNoExiste('categorias_inmobiliario', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    descripcion: { type: DataTypes.STRING(255), allowNull: true },
    estado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    fecha_creacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    fecha_actualizacion: { type: DataTypes.DATE, allowNull: true },
  });

  await crearTablaSiNoExiste('productos_inmobiliario', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    categoria_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'categorias_inmobiliario', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    nombre: { type: DataTypes.STRING(120), allowNull: false },
    descripcion: { type: DataTypes.STRING(255), allowNull: true },
    cantidad_actual: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    estado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    fecha_creacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    fecha_actualizacion: { type: DataTypes.DATE, allowNull: true },
  });

  await crearTablaSiNoExiste('inmobiliario_movimientos', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    producto_inmobiliario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'productos_inmobiliario', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    tipo_movimiento: { type: DataTypes.ENUM('ENTRADA', 'SALIDA'), allowNull: false },
    cantidad: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    cantidad_anterior: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    cantidad_nueva: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    observacion: { type: DataTypes.STRING(255), allowNull: true },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'usuarios', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    fecha_movimiento: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });

  console.log('Tablas de inmobiliario configuradas correctamente');
}

module.exports = crearTablasInmobiliario;
