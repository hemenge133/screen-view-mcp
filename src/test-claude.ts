import 'dotenv/config';
import { Anthropic } from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

/**
 * Test Claude's ability to analyze an image from a file
 */
async function testClaudeWithImage(imagePath: string) {
  // Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Error: ANTHROPIC_API_KEY environment variable is not set');
    process.exit(1);
  }

  try {
    // Read the image file
    console.log(`Reading image from: ${imagePath}`);
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    console.log(`Image loaded (${imageBuffer.length} bytes)`);

    // Send to Claude
    console.log('Sending image to Claude for analysis...');
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Describe what you see in this image in detail.' },
            { 
              type: 'image', 
              source: { 
                type: 'base64', 
                media_type: 'image/png', 
                data: base64Image 
              } 
            }
          ]
        }
      ]
    });

    console.log('\nClaude Analysis:');
    console.log('----------------------------------------');
    console.log(response.content[0].text);
    console.log('----------------------------------------');
  } catch (error) {
    console.error('Error during test:', error);
    
    // Additional debug info
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      if ('error' in (error as any)) {
        console.error('API error:', (error as any).error);
      }
    }
  }
}

// Check if a file path was provided
if (process.argv.length < 3) {
  console.error('Usage: npx ts-node src/test-claude.ts <path-to-png-image>');
  process.exit(1);
}

// Get the image path from command line arguments
const imagePath = process.argv[2];
testClaudeWithImage(imagePath); 