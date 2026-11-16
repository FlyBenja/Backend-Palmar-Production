const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', 'src');
const modulesRoot = path.join(root, 'modules');

const prefixes = {
  'auth/authRoutes.js': '/api/auth',
  'usuarios/usuariosRoutes.js': '/api/usuarios',
  'hotel/clientes/clienteRoutes.js': '/api/clientes',
  'hotel/estados/estadoHabitacionRoutes.js': '/api/estados-habitacion',
  'hotel/habitaciones/habitacionRoutes.js': '/api/habitaciones',
  'hotel/imagenes/habitacionImagenRoutes.js': '/api/habitaciones',
  'hotel/reservaciones/reservacionRoutes.js': '/api/reservaciones',
  'hotel/tarifas/tarifaRoutes.js': '/api/tarifas',
  'inmobiliario/inmobiliarioRoutes.js': '/api/inmobiliario',
  'insumos/insumosRoutes.js': '/api/insumos',
  'insumosCocina/insumosCocinaRoutes.js': '/api/insumos-cocina',
  'restaurante/creditos/creditoRoutes.js': '/api/creditos',
  'restaurante/eventos/eventoRoutes.js': '/api/eventos',
  'restaurante/inventario/inventarioRoutes.js': '/api/inventario',
  'restaurante/menu/menuRoutes.js': '/api/menu',
  'restaurante/ordenes/ordenRoutes.js': '/api/ordenes',
  'restaurante/reportes/reporteFinancieroRoutes.js': '/api/reportes',
};

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const routes = new Set();
for (const [relative, prefix] of Object.entries(prefixes)) {
  const content = fs.readFileSync(path.join(modulesRoot, relative), 'utf8');
  const regex = /router\.(get|post|patch|delete)\(\s*['"]([^'"]+)['"]/gims;
  let match;
  while ((match = regex.exec(content))) {
    const method = match[1].toUpperCase();
    let routePath = `${prefix}${match[2] === '/' ? '' : match[2]}`;
    routePath = routePath.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
    routes.add(`${method} ${routePath}`);
  }
}

const docs = new Set();
for (const file of walk(root).filter((item) => item.endsWith('.js'))) {
  const content = fs.readFileSync(file, 'utf8');
  const blockRegex = /\/\*\*([\s\S]*?)\*\//g;
  let blockMatch;
  while ((blockMatch = blockRegex.exec(content))) {
    if (!blockMatch[1].includes('@swagger')) continue;
    const lines = blockMatch[1].split(/\r?\n/).map((line) => line.replace(/^\s*\*\s?/, ''));
    let currentPath = null;
    for (const line of lines) {
      const pathMatch = line.match(/^\s*(\/api\/[^:]+):\s*$/);
      if (pathMatch) {
        currentPath = pathMatch[1];
        continue;
      }
      const methodMatch = line.match(/^\s{2}(get|post|patch|delete|put):\s*$/i);
      if (currentPath && methodMatch) docs.add(`${methodMatch[1].toUpperCase()} ${currentPath}`);
    }
  }
}

const missing = [...routes].filter((route) => !docs.has(route)).sort();
if (missing.length) {
  console.error('Faltan rutas en Swagger:');
  missing.forEach((route) => console.error(` - ${route}`));
  process.exit(1);
}

console.log(`Swagger completo: ${routes.size} operaciones documentadas.`);
