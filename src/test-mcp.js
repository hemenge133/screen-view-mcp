// Test client for MCP server
const { McpClient } = require('@modelcontextprotocol/sdk');
const { spawn } = require('child_process');
const path = require('path');

async function main() {
  try {
    console.log('Starting MCP client test');
    
    // Start the server as a child process
    const serverProcess = spawn('node', [path.join(process.cwd(), 'dist', 'mcp-server.js')], {
      env: process.env,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Log server output
    serverProcess.stdout.on('data', (data) => {
      console.log(`Server: ${data}`);
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.error(`Server error: ${data}`);
    });
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create a client using pipe transport
    const transport = {
      async sendMessage(message) {
        serverProcess.stdin.write(JSON.stringify(message) + '\n');
      },
      
      async receiveMessage() {
        return new Promise((resolve) => {
          serverProcess.stdout.once('data', (data) => {
            const messages = data.toString().trim().split('\n');
            for (const message of messages) {
              try {
                const parsed = JSON.parse(message);
                resolve(parsed);
                return;
              } catch (e) {
                // Not valid JSON, might be logging
              }
            }
          });
        });
      }
    };
    
    const client = new McpClient({ transport });
    
    // Connect to the server
    console.log('Connecting to server...');
    await client.connect();
    console.log('Connected to server');
    
    // Get server info
    const info = await client.getServerInfo();
    console.log('Server info:', info);
    
    // Capture and analyze screen
    console.log('Capturing and analyzing screen...');
    const result = await client.invokeFunction('mcp_screen_view_mcp_captureAndAnalyzeScreen', {
      prompt: 'What do you see in this screenshot? Provide a detailed analysis.',
      saveScreenshot: true
    });
    
    console.log('\nClaude Analysis:');
    console.log('----------------------------------------');
    console.log(result.content[0].text);
    console.log('----------------------------------------');
    
    // Clean up
    serverProcess.kill();
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 