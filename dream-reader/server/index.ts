import { app } from './app';

const PORT = process.env.PORT || 3050;

const server = app.listen(PORT, () => {
  console.log(`ReadMaster Translation Proxy running on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  server.close(() => {
    process.exit(0);
  });
});
