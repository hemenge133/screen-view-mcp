import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Anthropic } from '@anthropic-ai/sdk';
import { z } from 'zod';
import path from 'path';
import { captureScreenshot, saveScreenshotToFile } from './services/screenshot';

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
    version: '1.1.0',
    description: 'A tool for capturing and analyzing screenshots using Claude Vision'
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
        .describe('Claude model to use (default: claude-3-opus-20240229)'),
      saveScreenshot: z.boolean().optional().describe('Whether to save a copy of the screenshot'),
    },
    async ({ prompt, modelName, saveScreenshot }: CaptureAndAnalyzeScreenParams = {}) => {
      try {
        // Capture screenshot
        const base64Image = await captureScreenshot();

        // Save screenshot if requested
        if (saveScreenshot) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const filePath = path.join(process.cwd(), 'screenshots', `screenshot-${timestamp}.png`);
          await saveScreenshotToFile(base64Image, filePath);
          console.log(`Screenshot saved to: ${filePath}`);
        }

        // Send to Claude for analysis
        const response = await anthropic.messages.create({
          model: modelName || "claude-3-opus-20240229",
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt || 'What do you see in this screenshot?' },
                { type: 'image', source: { type: 'base64', media_type: 'image/png', data: base64Image } }
              ]
            }
          ]
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
  console.log('Server started successfully');
}
