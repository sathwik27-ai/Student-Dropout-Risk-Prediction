// server.ts - Next.js + Socket.IO standalone server
import { setupSocket } from '@/lib/socket';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const PORT = Number(process.env.PORT) || 3001;
const HOSTNAME = process.env.HOST || '0.0.0.0';

async function createServerWithSocket() {
  try {
    // Initialize Next.js
    const nextApp = next({
      dev,
      dir: process.cwd(),
      conf: dev ? undefined : { distDir: './.next' },
    });

    await nextApp.prepare();
    const handle = nextApp.getRequestHandler();

    // Create HTTP server
    const server = createServer((req, res) => {
      handle(req, res); // Next.js handles all routes including /api
    });

    // Setup Socket.IO
    const io = new Server(server, {
      path: '/api/socketio',
      cors: {
        origin: '*', // Use your frontend URL in production
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Initialize Socket.IO logic
    setupSocket(io);

    // Start server
    server.listen(PORT, HOSTNAME, () => {
      const displayHost = HOSTNAME === '0.0.0.0' ? 'localhost' : HOSTNAME;
      console.log(`> Next.js ready on http://${displayHost}:${PORT}`);
      console.log(`> Socket.IO server running at ws://${displayHost}:${PORT}/api/socketio`);
    });

    // Handle port errors
    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Kill existing processes and restart.`);
      } else {
        console.error('Server error:', err);
      }
      process.exit(1);
    });

    // Graceful shutdown
    const shutdown = () => {
      io.close();
      server.close(() => {
        console.log('> Server closed');
        process.exit(0);
      });
      setTimeout(() => process.exit(0), 2000).unref();
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
}

// Start the server
createServerWithSocket();
