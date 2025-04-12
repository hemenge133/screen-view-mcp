import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env file
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get API key from environment
const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.error('Error: ANTHROPIC_API_KEY not found in .env file');
  process.exit(1);
}

// Create MCP configuration
const mcpConfig = {
  mcpServers: {
    "screen-view-mcp": {
      command: process.platform === 'win32' ? 'node.exe' : 'node',
      args: [
        path.join(__dirname, 'screenshot-mcp-server.mjs'),
        `--api-key=${apiKey}`
      ],
      transport: "stdio"
    }
  }
};

// Ensure .cursor directory exists
const cursorDir = path.join(__dirname, '.cursor');
if (!fs.existsSync(cursorDir)) {
  fs.mkdirSync(cursorDir);
}

// Write configuration
const configPath = path.join(cursorDir, 'mcp.json');
fs.writeFileSync(configPath, JSON.stringify(mcpConfig, null, 2));

console.log(`MCP configuration generated at ${configPath}`); 