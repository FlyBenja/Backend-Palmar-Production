require('dotenv').config();

const app = require('./app');
const sequelize = require('./config/database');

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    await sequelize.authenticate();

    console.log('Conexión a MariaDB exitosa');

    app.listen(PORT, () => {
      const serverUrl = process.env.SERVER_URL || `http://localhost:${PORT}`;
      console.log(`Servidor corriendo en ${serverUrl}`);
      console.log(`Swagger en ${serverUrl}/api-docs/`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

main();