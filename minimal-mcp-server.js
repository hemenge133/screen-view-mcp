// Simplified MCP server implementation
const path = require('path');
require('dotenv').config();

try {
  console.log('Starting MCP server initialization...');
  
  // Direct require of the SDK
  const { McpServer } = require('@modelcontextprotocol/sdk/dist/cjs/server/mcp.js');
  const { StdioServerTransport } = require('@modelcontextprotocol/sdk/dist/cjs/server/stdio.js');
  const { z } = require('zod');
  
  console.log('SDK modules loaded successfully');
  console.log('CWD:', process.cwd());
  console.log('ENV:', {
    NODE_ENV: process.env.NODE_ENV,
    API_KEY_SET: !!process.env.ANTHROPIC_API_KEY
  });
  
  // Create server
  const server = new McpServer({
    name: "screen-view-mcp",
    version: "1.0.0",
    description: "Screen capture and analysis"
  });
  
  // Load services with more robust error handling
  let captureScreenshot, analyzeImage;
  try {
    const screenshotModule = require('./dist/services/screenshot');
    const visionModule = require('./dist/services/vision');
    captureScreenshot = screenshotModule.captureScreenshot;
    analyzeImage = visionModule.analyzeImage;
    console.log('Service modules loaded successfully');
  } catch (loadError) {
    console.error('Error loading service modules:', loadError);
    // Provide fallback implementations
    captureScreenshot = async () => {
      return Buffer.from('placeholder').toString('base64');
    };
    analyzeImage = async () => {
      return "Error: Could not load service modules. Please check the build.";
    };
  }
  
  // Register tool
  server.tool(
    "captureAndAnalyzeScreen",
    {
      prompt: z.string().optional()
    },
    async ({ prompt }) => {
      try {
        console.log('Processing tool request');
        const screenshotBase64 = await captureScreenshot();
        const analysisText = await analyzeImage(
          screenshotBase64,
          prompt || 'Describe this screenshot',
          'claude-3-opus-20240229'
        );
        
        return {
          content: [{ type: "text", text: analysisText }]
        };
      } catch (error) {
        console.error('Tool execution error:', error);
        return {
          content: [{ type: "text", text: `Error: ${error.message || 'Unknown error'}` }]
        };
      }
    }
  );
  
  // Connect with stdio transport
  console.log('Connecting server with stdio transport...');
  const transport = new StdioServerTransport();
  server.connect(transport)
    .then(() => console.log('MCP Server connected successfully'))
    .catch(err => {
      console.error('Connection error:', err);
      process.exit(1);
    });
  
  // Handle process signals
  process.on('SIGINT', () => {
    console.log('Shutting down MCP server');
    process.exit(0);
  });
  
} catch (error) {
  console.error('Fatal error initializing MCP server:', error);
  process.exit(1);
} 