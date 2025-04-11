import { Server, ServerConfig } from '@modelcontextprotocol/sdk';
import { captureScreenshot } from './screenshot';
import { analyzeImage } from './vision';
import { logInfo, logError } from '../utils/logger';

// Define parameter type for the tool handler
interface CaptureAndAnalyzeParams {
  prompt?: string;
  modelName?: string;
  saveScreenshot?: boolean;
}

/**
 * Creates and configures an MCP server for screen capture and analysis
 * 
 * @returns Configured MCP server instance
 */
export function createMCPServer(): Server {
  // Define server configuration
  const config: ServerConfig = {
    info: {
      name: 'screen-view-mcp',
      version: '1.0.0',
      description: 'MCP Server for screen capture and analysis',
    }
  };

  // Create server instance
  const server = new Server(config);

  // Register the captureAndAnalyzeScreen tool
  server.registerTool({
    name: 'captureAndAnalyzeScreen',
    description: 'Captures the screen and analyzes it using Claude 3 Opus vision model',
    parameters: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Prompt to use for analyzing the screen content',
        },
        modelName: {
          type: 'string',
          description: 'Claude model to use (defaults to claude-3-opus-20240229)',
        },
        saveScreenshot: {
          type: 'boolean',
          description: 'Whether to save the screenshot to a file for debugging',
        },
      },
      required: [],
    },
    handler: async ({ prompt, modelName, saveScreenshot }: CaptureAndAnalyzeParams) => {
      try {
        logInfo('Processing captureAndAnalyzeScreen request', { prompt, modelName });
        
        // Capture the screenshot
        const screenshotBase64 = await captureScreenshot();
        
        // Analyze the screenshot with Claude
        const analysisText = await analyzeImage(
          screenshotBase64,
          prompt || 'What do you see in this screenshot? Describe it in detail.',
          modelName || 'claude-3-opus-20240229'
        );
        
        // Return the analysis result
        return {
          analysis: analysisText,
          success: true,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logError('Error in captureAndAnalyzeScreen', { error: errorMessage });
        return {
          success: false,
          error: errorMessage,
        };
      }
    },
  });

  return server;
}