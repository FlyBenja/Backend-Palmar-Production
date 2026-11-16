# Backend Palmar - MariaDB

Versión preparada para desplegar en el servidor Hotel Palmar con MariaDB local.

## Base de datos

La conexión utiliza variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASSWORD` desde `.env`.

## Instalación en el servidor

```bash
cd /var/www/hotel-palmar/backend
npm install
npm run db:init
npm start
```

Después de validar que funciona, se recomienda ejecutarlo con PM2 o systemd.
# Backend-Palmar-Production
