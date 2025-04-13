#!/usr/bin/env node

// Screen capture MCP server with direct module imports
import path from 'path';
import { z } from 'zod';
import { captureScreenshot } from './services/screenshot';
import { analyzeImage } from './services/vision';

// Add arg parsing for transport type and port
const args = process.argv.slice(2);
const transportType = args.includes('--sse') ? 'sse' : 'stdio';
const portIndex = args.indexOf('--port');
const port = portIndex !== -1 ? parseInt(args[portIndex + 1], 10) : 8080;
const hostIndex = args.indexOf('--host');
const host = hostIndex !== -1 ? args[hostIndex + 1] : 'localhost';
const verboseLogging = args.includes('--verbose') || args.includes('-v');

// Function for enhanced logging
function logVerbose(...args: any[]): void {
  if (verboseLogging) {
    console.log('[VERBOSE]', ...args);
  }
}

// Log startup details
console.log('🚀 Starting screen-view-mcp server...');
console.log(`🔌 Transport: ${transportType}`);
if (transportType === 'sse') {
  console.log(`📡 SSE server will run on http://${host}:${port}/sse`);
}

// Check for API key
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('❌ ERROR: ANTHROPIC_API_KEY environment variable not set!');
  console.error('   Please set this variable before starting the server.');
  console.error('   Example: export ANTHROPIC_API_KEY=your-key-here (Linux/Mac)');
  console.error('   Example: set ANTHROPIC_API_KEY=your-key-here (Windows)');
  process.exit(1);
} else {
  const maskedKey = apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 5);
  console.log(`🔑 API key loaded: ${maskedKey}`);
  logVerbose('API key length:', apiKey.length);
  logVerbose('API key starts with:', apiKey.substring(0, 5));
}

// Use dynamic require for MCP SDK to avoid ESM/CommonJS issues
const sdkBasePath = path.join(__dirname, '../node_modules/@modelcontextprotocol/sdk');
const mcpPath = path.join(sdkBasePath, 'dist/cjs/server/mcp.js');
const stdioPath = path.join(sdkBasePath, 'dist/cjs/server/stdio.js');
const ssePath = path.join(sdkBasePath, 'dist/cjs/server/sse.js');

// Import MCP SDK modules using require
const mcp = require(mcpPath);
const stdio = require(stdioPath);
let sse: any;

// Try to import SSE module
try {
  sse = require(ssePath);
  if (transportType === 'sse') {
    console.log('✅ SSE module loaded successfully');
  }
} catch (error) {
  if (transportType === 'sse') {
    console.error('❌ SSE transport requested but module not found:', (error as Error).message);
    console.error('   This may be due to an outdated @modelcontextprotocol/sdk version');
    console.error('   Try updating to the latest version with: npm update @modelcontextprotocol/sdk');
    process.exit(1);
  }
}

// Function to map user-friendly model names to actual Anthropic model IDs
function normalizeModelName(modelName: string): string {
  const modelMap: Record<string, string> = {
    // Claude 3.5 models
    'claude-3-5-sonnet': 'claude-3-5-sonnet-20240620',
    'claude-3.5-sonnet': 'claude-3-5-sonnet-20240620',
    'claude-3.5': 'claude-3-5-sonnet-20240620',
    
    // Claude 3 models
    'claude-3-opus': 'claude-3-opus-20240229',
    'claude-3-sonnet': 'claude-3-sonnet-20240229',
    'claude-3-haiku': 'claude-3-haiku-20240307',
    
    // Defaults to Opus if no match
    'default': 'claude-3-opus-20240229'
  };
  
  console.log(`Normalizing model name: ${modelName}`);
  
  // If it's already a full model ID (contains date), return as is
  if (modelName.match(/\d{8}$/)) {
    console.log(`Using exact model ID: ${modelName}`);
    return modelName;
  }
  
  // Otherwise look up in map, with fallback to default
  const normalizedModel = modelMap[modelName.toLowerCase()] || modelMap['default'];
  console.log(`Mapped ${modelName} to ${normalizedModel}`);
  return normalizedModel;
}

/**
 * Main function to initialize and run the MCP server
 */
async function main() {
  try {
    // Create server
    const server = new mcp.McpServer({
      name: 'screen-view-mcp',
      version: '2.0.15',
      description: 'Screen capture and analysis with Claude Vision',
    });

    console.log('📋 Registering MCP tools...');

    // Register the hello world tool for testing
    server.tool(
      'helloWorld',
      {
        message: z.string().optional(),
      },
      async ({ message }: { message?: string }) => {
        console.log('Tool invoked: helloWorld', message ? `with message: ${message}` : 'without message');
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
          console.log('📸 Capturing screenshot...');
          const screenshotBase64 = await captureScreenshot();
          console.log('✅ Screenshot captured successfully');
          
          const analysisPrompt = prompt || 'What do you see in this screenshot? Describe it in detail.';
          // Normalize the model name to handle user-friendly names
          const defaultModel = process.env.DEFAULT_MODEL || 'claude-3-opus-20240229';
          const userModel = modelName || defaultModel;
          const model = normalizeModelName(userModel);
          
          console.log(`🧠 Analyzing image with Claude (${model})...`);
          logVerbose('Analysis prompt:', analysisPrompt);
          
          const analysis = await analyzeImage(screenshotBase64, analysisPrompt, model);
          console.log('✅ Analysis complete');
          return {
            content: [{ type: 'text', text: analysis }],
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('❌ Error in captureAndAnalyzeScreen tool:', errorMessage);
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

    console.log('✅ All tools registered successfully');

    // Connect with appropriate transport
    if (transportType === 'sse') {
      console.log('🔌 Connecting server with SSE transport...');
      logVerbose('SSE configuration:', { port, host });
      
      const transport = new sse.SseServerTransport({ 
        port: port,
        host: host,
        cors: {
          allowOrigin: "*",
          allowMethods: "GET, POST, OPTIONS",
          allowHeaders: "Content-Type, Authorization"
        }
      });
      
      server.connect(transport)
        .then(() => {
          console.log(`✅ MCP Server connected successfully via SSE on http://${host}:${port}/sse`);
          console.log('🚀 Server is ready to accept connections');
        })
        .catch((err: Error) => {
          console.error('❌ Connection error:', err.message);
          logVerbose('Error details:', err);
          process.exit(1);
        });
    } else {
      // Default to stdio transport
      console.log('🔌 Connecting server with stdio transport...');
      const transport = new stdio.StdioServerTransport();
      server.connect(transport)
        .then(() => {
          console.log('✅ MCP Server connected successfully via stdio');
          console.log('🚀 Server is ready to process requests');
        })
        .catch((err: Error) => {
          console.error('❌ Connection error:', err.message);
          logVerbose('Error details:', err);
          process.exit(1);
        });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Fatal error initializing MCP server:', errorMessage);
    console.error(error instanceof Error ? error.stack : '');
    process.exit(1);
  }
}

// Run the main function
main();
