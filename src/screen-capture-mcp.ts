#!/usr/bin/env node

// Screen capture MCP server with direct module imports
import path from 'path';
import { z } from 'zod';
import { captureScreenshot } from './services/screenshot';
import { analyzeImage } from './services/vision';

// Use dynamic require for MCP SDK to avoid ESM/CommonJS issues
const sdkBasePath = path.join(__dirname, '../node_modules/@modelcontextprotocol/sdk');
const mcpPath = path.join(sdkBasePath, 'dist/cjs/server/mcp.js');
const stdioPath = path.join(sdkBasePath, 'dist/cjs/server/stdio.js');

// Import MCP SDK modules using require
const mcp = require(mcpPath);
const stdio = require(stdioPath);

/**
 * Main function to initialize and run the MCP server
 */
async function main() {
  try {
    console.log('Starting screen capture MCP server...');

    console.log('All modules loaded');
    console.log('API_KEY_SET:', !!process.env.ANTHROPIC_API_KEY);

    // Create server
    const server = new mcp.McpServer({
      name: 'screen-view-mcp',
      version: '1.0.0',
      description: 'Screen capture and analysis with Claude Vision',
    });

    // Register the hello world tool for testing
    server.tool(
      'helloWorld',
      {
        message: z.string().optional(),
      },
      async ({ message }: { message?: string }) => {
        console.log('Hello world tool invoked with message:', message);
        return {
          content: [
            {
              type: 'text',
              text: `Hello! You said: "${message || 'No message provided'}"`,
            },
          ],
        };
      }
    );

    // Register the screen capture and analysis tool
    server.tool(
      'captureAndAnalyzeScreen',
      {
        prompt: z.string().optional(),
        modelName: z.string().optional(),
        saveScreenshot: z.boolean().optional(),
      },
      async ({
        prompt,
        modelName,
        saveScreenshot,
      }: {
        prompt?: string;
        modelName?: string;
        saveScreenshot?: boolean;
      }) => {
        try {
          console.log('Capturing screenshot...');
          const screenshotBase64 = await captureScreenshot();

          const analysisPrompt =
            prompt || 'What do you see in this screenshot? Describe it in detail.';
          const model = modelName || 'claude-3-opus-20240229';

          console.log('Analyzing image with Claude...');
          const analysis = await analyzeImage(screenshotBase64, analysisPrompt, model);

          console.log('Analysis complete');
          return {
            content: [{ type: 'text', text: analysis }],
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('Error in screen_capture tool:', errorMessage);
          return {
            content: [
              {
                type: 'text',
                text: `Error analyzing screenshot: ${errorMessage}`,
              },
            ],
          };
        }
      }
    );

    // Connect with stdio transport
    console.log('Connecting server with stdio transport...');
    const transport = new stdio.StdioServerTransport();
    server
      .connect(transport)
      .then(() => console.log('MCP Server connected successfully'))
      .catch((err: Error) => {
        console.error('Connection error:', err);
        process.exit(1);
      });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Fatal error initializing MCP server:', errorMessage);
    console.error(error instanceof Error ? error.stack : '');
    process.exit(1);
  }
}

// Run the main function
main();
