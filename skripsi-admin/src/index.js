const httpServer = require('./app');
const config = require('./config/environment');

const port = config.PORT;

console.log(`Starting server in ${config.DEPLOYMENT_MODE} mode...`);
console.log(`Environment: ${config.NODE_ENV}`);
console.log(`Database: ${config.DATABASE_HOST}:${config.DATABASE_PORT}`);

httpServer.listen(port, () => {
  const host = config.isLocal() ? 'localhost' : config.API_HOST;
  console.log(`API Server listening on: http://${host}:${port}`);
  console.log(`CORS allowed origins: ${config.ALLOWED_ORIGINS}`);
});

module.exports = httpServer;
