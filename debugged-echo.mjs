// Echo server with debugging best practices from MCP documentation
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Only log to stderr, not stdout (as per debugging guide)
const logToStderr = (...args) => {
  const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
  process.stderr.write(`${msg}\n`);
};

try {
  // Get absolute paths (recommended in debugging guide)
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  logToStderr(`Starting Echo server from ${__dirname}`);
  logToStderr(`Working directory: ${process.cwd()}`);
  
  // Create server
  const server = new McpServer({
    name: "Echo",
    version: "1.0.0"
  });

  // Add echo resource - exactly as in the example
  server.resource(
    "echo",
    new ResourceTemplate("echo://{message}", { list: undefined }),
    async (uri, { message }) => ({
      contents: [{
        uri: uri.href,
        text: `Resource echo: ${message}`
      }]
    })
  );

  // Add echo tool - exactly as in the example
  server.tool(
    "echo",
    { message: z.string() },
    async ({ message }) => {
      // Log tool usage to stderr
      logToStderr(`Echo tool called with: ${message}`);
      return {
        content: [{ type: "text", text: `Tool echo: ${message}` }]
      };
    }
  );

  // Add echo prompt - exactly as in the example
  server.prompt(
    "echo",
    { message: z.string() },
    ({ message }) => ({
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Please process this message: ${message}`
        }
      }]
    })
  );

  // Connect to the transport
  logToStderr('Connecting to stdio transport...');
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Log after connection established
  logToStderr('Echo server connected successfully');
  
} catch (error) {
  // Log errors to stderr for debugging
  logToStderr(`ERROR: ${error.stack || error}`);
  process.exit(1);
} 