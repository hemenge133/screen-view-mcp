// Test script for the Claude Vision API
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Anthropic } from '@anthropic-ai/sdk';
import { config } from 'dotenv';

// Load environment variables
config();

// Get absolute paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get API key from environment
const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error('Error: ANTHROPIC_API_KEY not found in environment');
  process.exit(1);
}

// Create Anthropic client
const anthropic = new Anthropic({
  apiKey: API_KEY,
});

// Helper function to log
const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);

async function testVision() {
  try {
    log('Testing Claude Vision API');
    
    // Check if we have a test image
    let base64Image;
    const testImagePath = path.join(__dirname, 'test-screenshot.png');
    
    if (fs.existsSync(testImagePath)) {
      log(`Using existing test image: ${testImagePath}`);
      base64Image = fs.readFileSync(testImagePath).toString('base64');
    } else {
      log('No test image found, creating one...');
      // Import screenshot module
      const screenshotUrl = new URL(`file://${path.join(__dirname, 'dist', 'services', 'screenshot.js').replace(/\\/g, '/')}`);
      const { captureScreenshot } = await import(screenshotUrl.href);
      
      // Take a screenshot
      base64Image = await captureScreenshot();
      
      // Save it for future tests
      fs.writeFileSync(testImagePath, Buffer.from(base64Image, 'base64'));
      log(`Screenshot saved to ${testImagePath}`);
    }
    
    // Call Claude API directly
    log('Calling Claude Vision API directly...');
    const prompt = 'What do you see in this screenshot? Provide a detailed description.';
    
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1024,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: prompt
            }
          ]
        }
      ]
    });
    
    // Extract the analysis text
    const analysisText = response.content
      .filter(item => item.type === 'text')
      .map(item => 'text' in item ? item.text : '')
      .join('\n');
    
    log('Analysis complete:');
    log('----------------------------------');
    log(analysisText);
    log('----------------------------------');
    
    log('Test completed successfully!');
  } catch (error) {
    log('Test failed with error:');
    log(error.message);
    log(error.stack);
    log('Error details:');
    log(JSON.stringify(error, null, 2));
  }
}

testVision(); 