import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import app from './app.js';

const start = async () => {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`\n🚀  Server running on http://localhost:${env.PORT}`);
    console.log(`📡  API base:   http://localhost:${env.PORT}/api/v1`);
    console.log(`❤️   Health:     http://localhost:${env.PORT}/health`);
    console.log(`🌍  Mode:       ${env.NODE_ENV}\n`);
  });

  const shutdown = (signal) => {
    console.log(`\n${signal} received — shutting down gracefully...`);
    server.close(() => {
      console.log('Server closed. Bye!\n');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err);
    server.close(() => process.exit(1));
  });
};

start();
