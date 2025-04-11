// Based on the example in the documentation
const { join } = require('path');
const { existsSync } = require('fs');

// Helper function to find the package's base path
const findPackagePath = () => {
  const possiblePaths = [
    join(process.cwd(), 'node_modules', '@modelcontextprotocol', 'sdk'),
    // Add other potential paths if needed
  ];
  
  for (const p of possiblePaths) {
    if (existsSync(p)) {
      return p;
    }
  }
  
  throw new Error('Cannot find @modelcontextprotocol/sdk package');
};

// Set up paths for ESM imports
const packagePath = findPackagePath();

try {
  require('dotenv').config();
  
  // Import the required modules
  const serverMcp = require(`${packagePath}/dist/cjs/server/mcp.js`);
  const serverStdio = require(`${packagePath}/dist/cjs/server/stdio.js`);
  
  const { McpServer } = serverMcp;
  const { StdioServerTransport } = serverStdio;
  
  // Create a server
  const server = new McpServer({
    name: "screen-view-mcp",
    version: "1.0.0",
    description: "MCP Server for screen capture and analysis"
  });
  
  // Import the screenshot and analysis functions
  const { captureScreenshot } = require('./dist/services/screenshot');
  const { analyzeImage } = require('./dist/services/vision');
  
  // Add a tool
  server.tool("captureAndAnalyzeScreen",
    {
      prompt: { type: 'string', optional: true, description: 'Prompt to use for analyzing the screen content' },
      modelName: { type: 'string', optional: true, description: 'Claude model to use (defaults to claude-3-opus-20240229)' },
      saveScreenshot: { type: 'boolean', optional: true, description: 'Whether to save the screenshot to a file for debugging' }
    },
    async ({ prompt, modelName, saveScreenshot }) => {
      try {
        console.log('Processing captureAndAnalyzeScreen request:', { prompt, modelName });
        
        // Capture screenshot
        const screenshotBase64 = await captureScreenshot();
        
        // Analyze the screenshot with Claude
        const analysisText = await analyzeImage(
          screenshotBase64,
          prompt || 'What do you see in this screenshot? Describe it in detail.',
          modelName || 'claude-3-opus-20240229'
        );
        
        // Return the analysis result in MCP format
        return {
          content: [{ type: "text", text: analysisText }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error in captureAndAnalyzeScreen:', errorMessage);
        return {
          content: [{ type: "text", text: `Error: ${errorMessage}` }],
          metadata: { error: errorMessage }
        };
      }
    }
  );
  
  // Start receiving messages on stdin and sending messages on stdout
  console.log('Starting MCP server with stdio transport...');
  const transport = new StdioServerTransport();
  server.connect(transport).then(() => {
    console.log('MCP Server connected and ready');
  }).catch(error => {
    console.error('Failed to connect MCP server:', error);
  });
  
} catch (error) {
  console.error('Server initialization error:', error);
  process.exit(1);
} 