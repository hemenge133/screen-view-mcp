import path from 'path';
import fs from 'fs';
import { Anthropic } from '@anthropic-ai/sdk';
import { captureScreenshot, saveScreenshotToFile } from './screenshot';

/**
 * Detects image type from base64 data by checking file signature
 * @param base64Image - Base64-encoded image data
 * @returns The detected MIME type
 */
function detectImageType(base64Image: string): 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp' {
  try {
    // Convert the first few bytes of base64 to a buffer to check signature
    const signatureBuffer = Buffer.from(base64Image.substring(0, 24), 'base64');
    
    // Check PNG signature (89 50 4E 47)
    if (
      signatureBuffer[0] === 0x89 && 
      signatureBuffer[1] === 0x50 && 
      signatureBuffer[2] === 0x4E && 
      signatureBuffer[3] === 0x47
    ) {
      return 'image/png';
    }
    
    // Check JPEG signature (FF D8 FF)
    if (
      signatureBuffer[0] === 0xFF && 
      signatureBuffer[1] === 0xD8 && 
      signatureBuffer[2] === 0xFF
    ) {
      return 'image/jpeg';
    }
    
    // Default to PNG if we can't detect
    return 'image/png';
  } catch (error) {
    console.error('Error detecting image type:', error);
    return 'image/png'; // Default to PNG
  }
}

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
    
    // Handle multiple possible formats of base64 data
    const cleanedBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
    
    console.log('Debug: Base64 image length:', cleanedBase64.length);
    
    // Detect image type
    const mediaType = detectImageType(cleanedBase64);
    console.log('Debug: Detected media type:', mediaType);
    
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
                media_type: mediaType,
                data: cleanedBase64,
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
    
    // Clean base64 data
    const cleanedBase64 = screenshotBase64.replace(/^data:image\/\w+;base64,/, '');
    
    console.log('Debug: Screenshot base64 length:', cleanedBase64.length);
    
    // Detect image type
    const mediaType = detectImageType(cleanedBase64);
    console.log('Debug: Detected media type for screenshot:', mediaType);
    
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
                media_type: mediaType,
                data: cleanedBase64,
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