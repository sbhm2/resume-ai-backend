"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const App_1 = __importDefault(require("./App"));
const DEFAULT_PORT = 5000;
const START_PORT = Number.parseInt(process.env.PORT, 10) || DEFAULT_PORT;
const startServer = (port) => {
    // Keep a strong reference to the server so it isn't GC'd,
    // which can cause the process to exit immediately in some environments.
    const server = App_1.default.listen(port, () => {
        console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
    });
    server.on('error', (err) => {
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
