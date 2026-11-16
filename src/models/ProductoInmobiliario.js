const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductoInmobiliario = sequelize.define('ProductoInmobiliario', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  categoria_id: { type: DataTypes.INTEGER, allowNull: false },
  nombre: { type: DataTypes.STRING(120), allowNull: false },
  descripcion: { type: DataTypes.STRING(255), allowNull: true },
  cantidad_actual: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  estado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  fecha_creacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  fecha_actualizacion: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'productos_inmobiliario', timestamps: false });

module.exports = ProductoInmobiliario;
