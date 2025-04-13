#!/usr/bin/env node

import { startServer } from './server';

async function main() {
    try {
        await startServer();
        console.log('Screen View MCP server started successfully');
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

main(); 