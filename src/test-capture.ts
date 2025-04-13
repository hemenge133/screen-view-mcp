import 'dotenv/config';
import { Anthropic } from '@anthropic-ai/sdk';
import { captureScreenshot, saveScreenshotToFile } from './services/screenshot';
import path from 'path';
import fs from 'fs';

async function testScreenCapture() {
  // Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Error: ANTHROPIC_API_KEY environment variable is not set');
    process.exit(1);
  }

  try {
    console.log('Capturing screenshot...');
    const base64Image = await captureScreenshot();
    console.log('Screenshot captured successfully');

    // Save the screenshot with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(process.cwd(), 'screenshots', `test-screenshot-${timestamp}.png`);
    await saveScreenshotToFile(base64Image, filePath);
    console.log(`Screenshot saved to: ${filePath}`);
    
    // Read the file back and convert to base64 to ensure correct format
    console.log('Reading screenshot back for Claude...');
    const imageBuffer = fs.readFileSync(filePath);
    const imageBase64 = imageBuffer.toString('base64');

    // Analyze with Claude
    console.log('Sending to Claude for analysis...');
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
            { type: 'text', text: 'Describe what you see in this screenshot in detail.' },
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

    console.log('\nClaude Analysis:');
    console.log('----------------------------------------');
    console.log(response.content[0].text);
    console.log('----------------------------------------');
    console.log(`\nTest completed successfully. Screenshot saved at: ${filePath}`);
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

// Run the test
testScreenCapture(); 