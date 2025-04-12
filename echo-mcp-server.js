// Echo MCP Server (CommonJS version)
// Based on the SDK README example

// Use require instead of import
const path = require('path');
const fs = require('fs');

// Set up logging
const logFile = path.resolve(__dirname, 'echo-mcp-debug.log');
fs.writeFileSync(logFile, 'Echo MCP Server Log\n');

function log(msg) {
  const text = typeof msg === 'object' ? JSON.stringify(msg) : msg;
  console.log(text);
  fs.appendFileSync(logFile, text + '\n');
}

try {
  log('Starting Echo MCP Server...');

  // Use absolute paths to avoid path resolution issues
  const sdkPath = path.resolve(__dirname, 'node_modules', '@modelcontextprotocol', 'sdk');
  const mcpPath = path.resolve(sdkPath, 'dist', 'cjs', 'server', 'mcp.js');
  const stdioPath = path.resolve(sdkPath, 'dist', 'cjs', 'server', 'stdio.js');
  
  log(`SDK path: ${sdkPath}`);
  log(`MCP path: ${mcpPath}`);
  log(`Stdio path: ${stdioPath}`);
  
  // Check if paths exist
  log(`SDK path exists: ${fs.existsSync(sdkPath)}`);
  log(`MCP path exists: ${fs.existsSync(mcpPath)}`);
  log(`Stdio path exists: ${fs.existsSync(stdioPath)}`);

  // Direct requires to specific files using absolute paths
  const mcp = require(mcpPath);
  const stdio = require(stdioPath);
  const { z } = require('zod');

  log('SDK modules loaded successfully');

  // Create server
  const server = new mcp.McpServer({
    name: "Echo",
    version: "1.0.0"
  });

  // Add echo resource
  server.resource(
    "echo",
    new mcp.ResourceTemplate("echo://{message}", { list: undefined }),
    async (uri, { message }) => ({
      contents: [{
        uri: uri.href,
        text: `Resource echo: ${message}`
      }]
    })
  );

  // Add echo tool
  server.tool(
    "echo",
    { message: z.string() },
    async ({ message }) => ({
      content: [{ type: "text", text: `Tool echo: ${message}` }]
    })
  );

  // Add echo prompt
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

  // Connect with stdio transport
  log('Connecting to stdio transport...');
  const transport = new stdio.StdioServerTransport();
  
  server.connect(transport)
    .then(() => log('Echo server connected successfully'))
    .catch(err => {
      log(`Connection error: ${err}`);
      process.exit(1);
    });

} catch (error) {
  console.error('Server initialization error:', error);
  fs.appendFileSync(logFile, `ERROR: ${error.stack || error}\n`);
  process.exit(1);
} 