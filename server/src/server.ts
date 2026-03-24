import dns from 'dns';
import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

dns.setDefaultResultOrder('verbatim');

const PORT = env.PORT || 5000;

// Connect to Database and start server
const startServer = async () => {
    try {
        console.log('Attempting to connect to database...');
        await connectDB();
        console.log('Database connected successfully');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
