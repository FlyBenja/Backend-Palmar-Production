const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InsumoConsumo = sequelize.define('InsumoConsumo', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  reservacion_id: { type: DataTypes.INTEGER, allowNull: false },
  producto_inventario_id: { type: DataTypes.INTEGER, allowNull: false },
  usuario_id: { type: DataTypes.INTEGER, allowNull: true },
  inventario_movimiento_id: { type: DataTypes.INTEGER, allowNull: true },
  cantidad: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  stock_anterior: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  stock_nuevo: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  observacion: { type: DataTypes.STRING(255), allowNull: true },
  fecha_consumo: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'insumos_consumos',
  timestamps: false,
});

module.exports = InsumoConsumo;
