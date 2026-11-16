const assert = require('assert');
const {
  obtenerRangoDiaGuatemala,
  obtenerRangoFechasGuatemala,
  obtenerRangoSemanaGuatemala,
  obtenerRangoMesGuatemala,
  fechaSoloDiaISO,
} = require('../src/utils/dateUtils');

function iso(date) {
  return date.toISOString();
}

const dia = obtenerRangoDiaGuatemala('2026-08-28');
assert(dia, 'Debe crear el rango diario');
assert.strictEqual(iso(dia.inicio), '2026-08-28T06:00:00.000Z');
assert.strictEqual(iso(dia.fin), '2026-08-29T05:59:59.999Z');

const igual = obtenerRangoFechasGuatemala('2026-08-28', '2026-08-28');
assert(igual, 'Debe aceptar desde/hasta iguales');
assert.strictEqual(iso(igual.inicio), '2026-08-28T06:00:00.000Z');
assert.strictEqual(iso(igual.fin), '2026-08-29T05:59:59.999Z');

const semana = obtenerRangoSemanaGuatemala('2026-08-28');
assert(semana, 'Debe crear rango semanal');
assert.strictEqual(semana.fecha_inicio, '2026-08-24');
assert.strictEqual(semana.fecha_fin, '2026-08-30');
assert.strictEqual(iso(semana.inicio), '2026-08-24T06:00:00.000Z');
assert.strictEqual(iso(semana.fin), '2026-08-31T05:59:59.999Z');

const mes = obtenerRangoMesGuatemala('2026', '8');
assert(mes, 'Debe crear rango mensual');
assert.strictEqual(iso(mes.inicio), '2026-08-01T06:00:00.000Z');
assert.strictEqual(iso(mes.fin), '2026-09-01T05:59:59.999Z');

assert.strictEqual(fechaSoloDiaISO('2026-08-28T00:00:00.000Z'), '2026-08-28');
assert.strictEqual(fechaSoloDiaISO(new Date('2026-08-28T00:00:00.000Z')), '2026-08-28');
assert.strictEqual(obtenerRangoDiaGuatemala('2026-02-30'), null);

console.log('Pruebas de fechas Guatemala: OK');
