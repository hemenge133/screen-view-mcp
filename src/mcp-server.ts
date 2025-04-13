#!/usr/bin/env node

import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Anthropic } from '@anthropic-ai/sdk';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';
import { captureScreenshot, saveScreenshotToFile } from './services/screenshot.js';

// Verify API key is configured
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY is not set. Please add it to your .env file');
  process.exit(1);
}

/**
 * The main function that starts the MCP server
 */
async function main() {
  try {
    // Initialize the Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    // Create the MCP server
    const server = new McpServer({
      name: 'screen-view-mcp',
      version: '1.1.2',
      description: 'Capture screenshots and analyze them with Claude Vision API'
    });
    
    // Register the screenshot capture and analysis tool
    server.tool(
      'screen_capture',
      {
        prompt: z.string().optional().describe('Custom prompt to send to Claude'),
        modelName: z.string().optional().describe('Claude model to use'),
        saveScreenshot: z.boolean().optional().describe('Whether to save the screenshot')
      },
      async ({ prompt, modelName, saveScreenshot }) => {
        try {
          // Capture screenshot
          const base64Image = await captureScreenshot();
          
          // File path for saving
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const filePath = path.join(process.cwd(), 'screenshots', `screenshot-${timestamp}.png`);
          
          // Always save the screenshot temporarily to read it back correctly
          await saveScreenshotToFile(base64Image, filePath);
          
          // Read the file back to ensure correct format
          const imageBuffer = fs.readFileSync(filePath);
          const imageBase64 = imageBuffer.toString('base64');
          
          // Delete the file if not requested to save
          if (!saveScreenshot) {
            fs.unlinkSync(filePath);
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
                  { 
                    type: 'image', 
                    source: { 
                      type: 'base64', 
                      media_type: 'image/png', 
                      data: imageBase64 
                    } 
                  }
                ]
              }
            ]
          });

          return {
            content: [{ type: 'text', text: response.content[0].text }]
          };
        } catch (error) {
          console.error('Error in screen_capture:', error);
          throw error;
        }
      }
    );

    // Connect the server to the stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    // Set up graceful shutdown
    process.on('SIGINT', () => {
      console.log('Shutting down MCP server');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

// Start the server
main(); 