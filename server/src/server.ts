import dns from 'dns';
import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

dns.setDefaultResultOrder('verbatim');

const PORT = env.PORT || 5000;

const startServer = async () => {
    try {
        console.log('Attempting to connect to database...');
        await connectDB();
        console.log('Database connected successfully');
        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        // Keep process alive
        server.on('error', (err) => {
            console.error('Server error:', err);
        });

        process.on('SIGINT', () => {
            console.log('Shutting down...');
            server.close(() => process.exit(0));
        });

        process.on('SIGTERM', () => {
            server.close(() => process.exit(0));
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
