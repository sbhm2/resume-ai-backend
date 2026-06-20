import dotenv from 'dotenv';
dotenv.config();

import app from './App';

// Only start the HTTP server in non-serverless environments.
// On Vercel, the app is exported from api/index.ts and handled as a serverless function.
if (!process.env.VERCEL) {
    const DEFAULT_PORT = 3000;
    const START_PORT: number = Number.parseInt(process.env.PORT as string, 10) || DEFAULT_PORT;

    const startServer = (port: number) => {
        const server = app.listen(port, () => {
            console.log(
                `Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`
            );
        });

        server.on('error', (err: any) => {
            if (err?.code === 'EADDRINUSE') {
                const nextPort = port + 1;
                console.error(`Port ${port} is in use; trying ${nextPort}...`);
                server.close(() => startServer(nextPort));
                return;
            }
            console.error('HTTP server error:', err);
            process.exitCode = 1;
        });
    };

    startServer(START_PORT);
}

export default app;
