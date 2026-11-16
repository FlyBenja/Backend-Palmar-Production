const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InsumoAsignacion = sequelize.define('InsumoAsignacion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  producto_inventario_id: { type: DataTypes.INTEGER, allowNull: false },
  asignado_por_usuario_id: { type: DataTypes.INTEGER, allowNull: true },
  estado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  fecha_creacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  fecha_actualizacion: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'insumos_asignaciones',
  timestamps: false,
});

module.exports = InsumoAsignacion;
