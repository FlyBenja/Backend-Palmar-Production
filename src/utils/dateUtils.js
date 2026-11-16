const GUATEMALA_OFFSET = '-06:00';
const FECHA_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function validarFechaTexto(fechaTexto) {
  if (!fechaTexto || !FECHA_RE.test(String(fechaTexto))) return null;
  const [, anioTexto, mesTexto, diaTexto] = String(fechaTexto).match(FECHA_RE);
  const anio = Number(anioTexto);
  const mes = Number(mesTexto);
  const dia = Number(diaTexto);
  const fechaUtc = new Date(Date.UTC(anio, mes - 1, dia));
  if (
    fechaUtc.getUTCFullYear() !== anio ||
    fechaUtc.getUTCMonth() !== mes - 1 ||
    fechaUtc.getUTCDate() !== dia
  ) return null;
  return { anio, mes, dia };
}

function fechaTextoDesdePartes(anio, mes, dia) {
  return `${String(anio).padStart(4, '0')}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

function desplazarFechaTexto(fechaTexto, dias) {
  const partes = validarFechaTexto(fechaTexto);
  if (!partes) return null;
  const fecha = new Date(Date.UTC(partes.anio, partes.mes - 1, partes.dia));
  fecha.setUTCDate(fecha.getUTCDate() + Number(dias || 0));
  return fechaTextoDesdePartes(fecha.getUTCFullYear(), fecha.getUTCMonth() + 1, fecha.getUTCDate());
}

function fechaHoyGuatemala() {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Guatemala',
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const values = Object.fromEntries(partes.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function obtenerRangoDiaGuatemala(fechaTexto = fechaHoyGuatemala()) {
  if (!validarFechaTexto(fechaTexto)) return null;
  return {
    inicio: new Date(`${fechaTexto}T00:00:00.000${GUATEMALA_OFFSET}`),
    fin: new Date(`${fechaTexto}T23:59:59.999${GUATEMALA_OFFSET}`),
    fecha: fechaTexto,
  };
}

function obtenerRangoFechasGuatemala(fechaInicioTexto, fechaFinTexto) {
  const inicioTexto = fechaInicioTexto || fechaFinTexto || fechaHoyGuatemala();
  const finTexto = fechaFinTexto || fechaInicioTexto || inicioTexto;
  const inicioDia = obtenerRangoDiaGuatemala(inicioTexto);
  const finDia = obtenerRangoDiaGuatemala(finTexto);
  if (!inicioDia || !finDia) return null;
  return { inicio: inicioDia.inicio, fin: finDia.fin };
}

function obtenerRangoSemanaGuatemala(fechaTexto = fechaHoyGuatemala()) {
  const partes = validarFechaTexto(fechaTexto);
  if (!partes) return null;
  const fechaUtc = new Date(Date.UTC(partes.anio, partes.mes - 1, partes.dia));
  const diaSemana = fechaUtc.getUTCDay();
  const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1;
  const lunes = desplazarFechaTexto(fechaTexto, -diasDesdeLunes);
  const domingo = desplazarFechaTexto(lunes, 6);
  const inicio = obtenerRangoDiaGuatemala(lunes);
  const fin = obtenerRangoDiaGuatemala(domingo);
  return { inicio: inicio.inicio, fin: fin.fin, fecha_inicio: lunes, fecha_fin: domingo };
}

function obtenerRangoMesGuatemala(anioTexto, mesTexto) {
  const ahora = new Date();
  const fechaActualGT = fechaHoyGuatemala();
  const actual = validarFechaTexto(fechaActualGT);
  const anio = Number(anioTexto || actual?.anio || ahora.getUTCFullYear());
  const mes = Number(mesTexto || actual?.mes || ahora.getUTCMonth() + 1);
  if (!Number.isInteger(anio) || !Number.isInteger(mes) || mes < 1 || mes > 12) return null;
  const inicioTexto = fechaTextoDesdePartes(anio, mes, 1);
  const siguienteMes = mes === 12 ? { anio: anio + 1, mes: 1 } : { anio, mes: mes + 1 };
  const inicio = new Date(`${inicioTexto}T00:00:00.000${GUATEMALA_OFFSET}`);
  const fin = new Date(new Date(`${fechaTextoDesdePartes(siguienteMes.anio, siguienteMes.mes, 1)}T00:00:00.000${GUATEMALA_OFFSET}`).getTime() - 1);
  return { inicio, fin, anio, mes };
}

function fechaSoloDiaISO(valor) {
  if (!valor) return null;
  if (typeof valor === 'string') {
    const match = valor.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return null;
  return `${fecha.getUTCFullYear()}-${String(fecha.getUTCMonth() + 1).padStart(2, '0')}-${String(fecha.getUTCDate()).padStart(2, '0')}`;
}

module.exports = {
  fechaHoyGuatemala,
  obtenerRangoDiaGuatemala,
  obtenerRangoFechasGuatemala,
  obtenerRangoSemanaGuatemala,
  obtenerRangoMesGuatemala,
  fechaSoloDiaISO,
};
