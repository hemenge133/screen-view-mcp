import path from 'path';
import fs from 'fs';
import { Anthropic } from '@anthropic-ai/sdk';
import { captureScreenshot, saveScreenshotToFile } from './screenshot';

/**
 * Analyzes an image with Claude Vision API
 * @param base64Image - Base64-encoded image data
 * @param prompt - Prompt to send to Claude
 * @param modelName - Claude model name to use
 * @returns The analysis text
 */
export async function analyzeImage(
  base64Image: string,
  prompt: string = 'What do you see in this screenshot?',
  modelName: string = 'claude-3-opus-20240229'
): Promise<string> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }

    // Initialize the Anthropic client
    const client = new Anthropic({
      apiKey,
    });
    
    // Send to Claude for analysis
    const response = await client.messages.create({
      model: modelName,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
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

    return response.content[0].text;
  } catch (error) {
    console.error('Claude Vision API error:', error);
    throw error;
  }
}

export async function analyzeScreenContent(
  prompt: string,
  modelName = 'claude-3-haiku-20240307',
  saveScreenshot = false
): Promise<string> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }

    const client = new Anthropic({
      apiKey,
    });

    // Capture screenshot as base64
    const screenshotBase64 = await captureScreenshot();
    
    // Save screenshot if requested
    if (saveScreenshot) {
      const timestamp = Date.now();
      const screenshotDir = path.join(process.cwd(), 'screenshots');
      const screenshotPath = path.join(screenshotDir, `screenshot_${timestamp}.png`);
      await saveScreenshotToFile(screenshotBase64, screenshotPath);
      console.log(`Screenshot saved to ${screenshotPath}`);
    }

    // Analyze the screenshot with Claude
    const response = await client.messages.create({
      model: modelName,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: screenshotBase64,
              },
            },
            {
              type: 'text',
              text: prompt || 'Describe what you see in this screenshot in detail.',
            },
          ],
        },
      ],
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Error analyzing screen content:', error);
    throw error;
  }
} 