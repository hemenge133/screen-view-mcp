import { Anthropic } from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

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
  // Initialize the Anthropic client
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  });

  try {
    // Ensure image is in PNG format
    const imageBuffer = Buffer.from(base64Image, 'base64');
    const pngBuffer = await sharp(imageBuffer)
      .png()
      .toBuffer();
    
    // Convert to base64 for API
    const pngBase64 = pngBuffer.toString('base64');

    // Send to Claude for analysis
    const response = await anthropic.messages.create({
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
                data: pngBase64,
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