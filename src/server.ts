import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import screenshot from 'screenshot-desktop';
import { Anthropic } from '@anthropic-ai/sdk';
import { z } from 'zod';

interface CaptureAndAnalyzeScreenParams {
  prompt?: string;
  modelName?: string;
  saveScreenshot?: boolean;
}

export async function startServer() {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  const server = new McpServer({
    name: 'screen-view-mcp',
    version: '1.0.1',
  });

  server.tool(
    'mcp_screen_view_mcp_captureAndAnalyzeScreen',
    {
      prompt: z
        .string()
        .optional()
        .describe(
          'Custom prompt to send to Claude (default: "What do you see in this screenshot?")'
        ),
      modelName: z
        .string()
        .optional()
        .describe('Claude model to use (default: gpt-4-vision-preview)'),
      saveScreenshot: z.boolean().optional().describe('Whether to save a copy of the screenshot'),
    },
    async ({ prompt, modelName, saveScreenshot }: CaptureAndAnalyzeScreenParams = {}) => {
      try {
        // Capture screenshot
        const screenshotBuffer = await screenshot();

        // Save screenshot if requested
        if (saveScreenshot) {
          // TODO: Implement screenshot saving
          console.log('Screenshot saving not implemented yet');
        }

        // Convert buffer to base64
        const base64Image = screenshotBuffer.toString('base64');

        // Send to Claude for analysis
        const response = await anthropic.messages.create({
          model: modelName || 'gpt-4-vision-preview',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt || 'What do you see in this screenshot?',
                },
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: 'image/png',
                    data: base64Image,
                  },
                },
              ],
            },
          ],
        });

        return {
          content: [{ type: 'text', text: response.content[0].text }],
        };
      } catch (error) {
        console.error('Error in captureAndAnalyzeScreen:', error);
        throw error;
      }
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log('MCP server started');
}
