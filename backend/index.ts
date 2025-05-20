// /index.ts

import { app, prisma } from './app';
import { config } from './config';
import mongoose from 'mongoose';

async function checkPostgres() {
    try {
        await prisma.$connect();
        await prisma.$disconnect(); // quick connect/disconnect to check readiness
        console.log('✅ PostgreSQL is ready');
        return true;
    } catch (err) {
        console.error('❌ PostgreSQL is not ready:', err);
        return false;
    }
}

async function checkMongo() {
    try {
        const conn = await mongoose.createConnection(config.mongoUri).asPromise();
        await conn.close(); // quick connect/disconnect to check readiness
        console.log('✅ MongoDB is ready');
        return true;
    } catch (err) {
        console.error('❌ MongoDB is not ready:', err);
        return false;
    }
}

async function startServer() {
    const postgresReady = await checkPostgres();
    const mongoReady = await checkMongo();

    if (!postgresReady || !mongoReady) {
        console.error('❌ One or more databases are not ready. Exiting.');
        process.exit(1);
    }

    try {
        // Connect to PostgreSQL for app usage
        await prisma.$connect();
        console.log('✅ Connected to PostgreSQL database');

        // Connect to MongoDB for app usage
        await mongoose.connect(config.mongoUri);
        console.log('✅ Connected to MongoDB database');

        // Start the server
        app.listen(config.port, () => {
            console.log(`🚀 Server is running on port ${config.port}`);
            console.log(`📝 API Version: ${config.apiVersion}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    await prisma.$disconnect();
    await mongoose.connection.close();
    process.exit(0);
});

startServer();

