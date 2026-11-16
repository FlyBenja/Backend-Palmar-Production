const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InmobiliarioMovimiento = sequelize.define('InmobiliarioMovimiento', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  producto_inmobiliario_id: { type: DataTypes.INTEGER, allowNull: false },
  tipo_movimiento: { type: DataTypes.ENUM('ENTRADA', 'SALIDA'), allowNull: false },
  cantidad: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  cantidad_anterior: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  cantidad_nueva: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  observacion: { type: DataTypes.STRING(255), allowNull: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: true },
  fecha_movimiento: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { tableName: 'inmobiliario_movimientos', timestamps: false });

module.exports = InmobiliarioMovimiento;
