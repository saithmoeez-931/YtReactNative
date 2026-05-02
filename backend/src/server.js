const app = require('./app');
const connectDatabase = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDatabase();
    process.env.DEMO_MODE = 'false';
  } catch (error) {
    process.env.DEMO_MODE = 'true';
    console.warn('MongoDB unavailable. Starting in demo mode.');
    console.warn(error.message);
  }

  app.listen(PORT, () => {
    console.log(
      `Society Connect API is running on port ${PORT} (${process.env.DEMO_MODE === 'true' ? 'demo mode' : 'database mode'})`,
    );
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
