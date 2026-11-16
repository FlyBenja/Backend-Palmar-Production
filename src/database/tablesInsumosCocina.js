const { DataTypes } = require('sequelize');
const { crearTablaSiNoExiste } = require('./tableHelpers');

async function crearTablasInsumosCocina() {
  await crearTablaSiNoExiste('insumos_cocina_asignaciones', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'usuarios', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    producto_inventario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'productos_inventario', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    asignado_por_usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'usuarios', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    estado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    fecha_creacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    fecha_actualizacion: { type: DataTypes.DATE, allowNull: true },
  });

  await crearTablaSiNoExiste('insumos_cocina_consumos', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    producto_inventario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'productos_inventario', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'usuarios', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    inventario_movimiento_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'inventario_movimientos', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    cantidad: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    stock_anterior: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    stock_nuevo: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    destino: { type: DataTypes.STRING(150), allowNull: false },
    observacion: { type: DataTypes.STRING(255), allowNull: true },
    fecha_consumo: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });

  console.log('Tablas de insumos de cocina configuradas correctamente');
}

module.exports = crearTablasInsumosCocina;
