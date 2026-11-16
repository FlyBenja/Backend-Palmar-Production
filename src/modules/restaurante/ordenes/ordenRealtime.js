const jwt = require('jsonwebtoken');

// Canal SSE heredado (se conserva por compatibilidad).
const clientes = new Set();

// Canal de eventos long-polling. A diferencia de SSE, cada respuesta es finita,
// por lo que atraviesa reverse proxies con mucha más fiabilidad.
let secuenciaActual = 0;
let ultimoEvento = null;
const esperas = new Set();

function crearEvento(tipo, ordenId) {
  secuenciaActual += 1;
  return {
    id: `${Date.now()}-${secuenciaActual}-${Math.random().toString(36).slice(2)}`,
    secuencia: secuenciaActual,
    tipo,
    ordenId: ordenId || undefined,
    fecha: new Date().toISOString(),
  };
}

function responderEspera(espera, evento) {
  if (!esperas.has(espera)) return;
  esperas.delete(espera);
  clearTimeout(espera.timeout);

  try {
    espera.res.status(200).json({
      evento,
      secuencia: evento.secuencia,
    });
  } catch (error) {
    // El cliente pudo cerrar la conexión mientras se enviaba el evento.
  }
}

function publicarEventoOrdenes(tipo, ordenId) {
  const evento = crearEvento(tipo, ordenId);
  ultimoEvento = evento;

  // Compatibilidad SSE.
  const payload = `data: ${JSON.stringify(evento)}\n\n`;
  for (const cliente of [...clientes]) {
    try {
      cliente.write(payload);
    } catch (error) {
      clientes.delete(cliente);
    }
  }

  // Despierta inmediatamente a todos los clientes long-poll que estén esperando
  // una secuencia anterior. El frontend recarga la lista completa, así que basta
  // entregar el evento más reciente incluso si hubo varios cambios consecutivos.
  for (const espera of [...esperas]) {
    if (Number(espera.desde || 0) < evento.secuencia) {
      responderEspera(espera, evento);
    }
  }

  return evento;
}

function esperarEventoOrdenes(req, res) {
  const desde = Math.max(0, Number(req.query.desde || 0) || 0);

  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  });

  // Si el cliente perdió un evento entre una petición y la siguiente,
  // respondemos inmediatamente con el último disponible.
  if (ultimoEvento && ultimoEvento.secuencia > desde) {
    return res.status(200).json({
      evento: ultimoEvento,
      secuencia: ultimoEvento.secuencia,
    });
  }

  const espera = {
    desde,
    res,
    timeout: null,
  };

  espera.timeout = setTimeout(() => {
    if (!esperas.has(espera)) return;
    esperas.delete(espera);
    // 204 = no hubo cambios; el cliente abre otra espera inmediatamente.
    if (!res.headersSent) res.status(204).end();
    else res.end();
  }, 25000);

  esperas.add(espera);

  res.on('close', () => {
    if (!esperas.has(espera)) return;
    esperas.delete(espera);
    clearTimeout(espera.timeout);
  });

  return undefined;
}

function streamEventosOrdenes(req, res) {
  try {
    const token = String(req.query.token || '');
    if (!token) return res.status(401).json({ mensaje: 'Token no enviado' });

    const usuario = jwt.verify(token, process.env.JWT_SECRET);
    const rolId = Number(usuario.rol_id || usuario.rolId || usuario.rol);
    if (![1, 2, 3].includes(rolId)) return res.status(403).json({ mensaje: 'No tiene permisos para escuchar eventos' });

    res.status(200);
    res.set({
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.flushHeaders?.();
    res.write(`retry: 2000\nevent: ready\ndata: ${JSON.stringify({ ok: true, fecha: new Date().toISOString() })}\n\n`);
    clientes.add(res);

    const keepAlive = setInterval(() => {
      try { res.write(`: keep-alive ${Date.now()}\n\n`); } catch (error) { clearInterval(keepAlive); clientes.delete(res); }
    }, 15000);

    res.on('close', () => {
      clearInterval(keepAlive);
      clientes.delete(res);
    });
    return undefined;
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
}

module.exports = {
  publicarEventoOrdenes,
  streamEventosOrdenes,
  esperarEventoOrdenes,
};
