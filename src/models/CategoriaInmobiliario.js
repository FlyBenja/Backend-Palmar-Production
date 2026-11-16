const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CategoriaInmobiliario = sequelize.define('CategoriaInmobiliario', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  descripcion: { type: DataTypes.STRING(255), allowNull: true },
  estado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  fecha_creacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  fecha_actualizacion: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'categorias_inmobiliario', timestamps: false });

module.exports = CategoriaInmobiliario;
