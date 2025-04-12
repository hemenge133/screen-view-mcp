// Screen Capture MCP Server - Clean Version
// Purpose: Captures screenshots and analyzes them using Claude Vision API
// Usage: node screenshot-mcp-server.mjs --api-key=your_anthropic_api_key
// Author: Claude/Cursor Team
// Date: April 2025
// License: MIT

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
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
  
  logToStderr(`Starting Screen View MCP server from ${__dirname}`);
  logToStderr(`Working directory: ${process.cwd()}`);
  
  // Check API key
  if (process.env.ANTHROPIC_API_KEY) {
    logToStderr(`ANTHROPIC_API_KEY found: ${process.env.ANTHROPIC_API_KEY.substring(0, 10)}...`);
  } else {
    // Try to get from command line arguments
    const apiKeyArg = process.argv.find(arg => arg.startsWith('--api-key='));
    if (apiKeyArg) {
      process.env.ANTHROPIC_API_KEY = apiKeyArg.split('=')[1];
      logToStderr('Set ANTHROPIC_API_KEY from command line argument');
    } else {
      logToStderr('WARNING: No ANTHROPIC_API_KEY found');
    }
  }
  
  // Create server
  const server = new McpServer({
    name: "screen-view-mcp",
    version: "1.0.0",
    description: "Screen capture and analysis with Claude Vision"
  });

  // Add simplified tool - with debug mode
  server.tool(
    "captureAndAnalyzeScreen",
    {
      prompt: z.string().optional(),
      modelName: z.string().optional(),
      saveScreenshot: z.boolean().optional()
    },
    async ({ prompt, modelName, saveScreenshot }) => {
      try {
        logToStderr(`Tool called with prompt: ${prompt || 'default'}`);
        
        // Debug mode - return static response first to ensure tool works
        const debugMode = false;
        if (debugMode) {
          return {
            content: [{ type: "text", text: "Debug mode: This is a test response without taking a screenshot." }]
          };
        }
        
        // Import screenshot module
        logToStderr('Importing screenshot module...');
        const screenshotPath = path.join(__dirname, 'dist', 'services', 'screenshot.js');
        const screenshotUrl = new URL(`file://${screenshotPath.replace(/\\/g, '/')}`);
        const { captureScreenshot } = await import(screenshotUrl.href);
        
        // Capture screenshot
        logToStderr('Capturing screenshot...');
        const screenshotBase64 = await captureScreenshot();
        logToStderr('Screenshot captured successfully');
        
        // Save for debugging if requested
        if (saveScreenshot) {
          const debugPath = path.join(__dirname, 'debug-screenshot.png');
          fs.writeFileSync(debugPath, Buffer.from(screenshotBase64, 'base64'));
          logToStderr(`Screenshot saved to ${debugPath}`);
        }
        
        // Import vision module
        logToStderr('Importing vision module...');
        const visionPath = path.join(__dirname, 'dist', 'services', 'vision.js');
        const visionUrl = new URL(`file://${visionPath.replace(/\\/g, '/')}`);
        const { analyzeImage } = await import(visionUrl.href);
        
        // Analyze with Claude
        logToStderr('Analyzing screenshot with Claude...');
        const defaultPrompt = 'What do you see in this screenshot? Describe it in detail.';
        const defaultModel = 'claude-3-opus-20240229';
        
        const analysisText = await analyzeImage(
          screenshotBase64,
          prompt || defaultPrompt,
          modelName || defaultModel
        );
        
        logToStderr('Analysis complete');
        
        // Return in the exact format used by the working echo server
        return {
          content: [{ type: "text", text: analysisText }]
        };
      } catch (error) {
        logToStderr(`Error: ${error.message}`);
        logToStderr(error.stack);
        
        // Return error in the exact format used by the working echo server
        return {
          content: [{ type: "text", text: `Error analyzing screenshot: ${error.message}` }]
        };
      }
    }
  );

  // Connect to the transport
  logToStderr('Connecting to stdio transport...');
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Log after connection established
  logToStderr('Screen View MCP server connected successfully');
  
} catch (error) {
  // Log errors to stderr for debugging
  logToStderr(`ERROR: ${error.stack || error}`);
  process.exit(1);
} 