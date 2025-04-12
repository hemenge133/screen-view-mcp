// Test script for the screenshot functionality
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get absolute paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Attempt to load dotenv if available
try {
  (await import('dotenv')).config();
  console.log('Environment variables loaded from .env');
} catch (e) {
  console.log('No dotenv module or .env file found');
}

async function runTest() {
  try {
    console.log('Testing screenshot functionality...');
    
    // Import the service modules with proper file:// URLs for ESM compatibility
    const screenshotPath = path.join(__dirname, 'dist', 'services', 'screenshot.js');
    const visionPath = path.join(__dirname, 'dist', 'services', 'vision.js');
    
    // Convert to file URLs for ESM imports
    const screenshotUrl = new URL(`file://${screenshotPath.replace(/\\/g, '/')}`);
    const visionUrl = new URL(`file://${visionPath.replace(/\\/g, '/')}`);
    
    console.log(`Importing screenshot module from: ${screenshotUrl}`);
    console.log(`Importing vision module from: ${visionUrl}`);
    
    const { captureScreenshot } = await import(screenshotUrl.href);
    const { analyzeImage } = await import(visionUrl.href);
    
    // Take a screenshot
    console.log('Capturing screenshot...');
    const screenshotBase64 = await captureScreenshot();
    console.log(`Screenshot captured (${screenshotBase64.length} bytes in base64)`);
    
    // Save the screenshot to a file for verification
    const debugPath = path.join(__dirname, 'test-screenshot.png');
    fs.writeFileSync(debugPath, Buffer.from(screenshotBase64, 'base64'));
    console.log(`Screenshot saved to ${debugPath}`);
    
    // Check if API key is available
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.log('WARNING: No ANTHROPIC_API_KEY found in environment. Skipping image analysis.');
      return;
    }
    
    // Analyze the screenshot
    console.log('Analyzing screenshot with Claude...');
    const analysisText = await analyzeImage(
      screenshotBase64,
      'What do you see in this screenshot? Provide a detailed description.',
      'claude-3-opus-20240229'
    );
    
    console.log('Analysis complete:');
    console.log('----------------------------------');
    console.log(analysisText);
    console.log('----------------------------------');
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed with error:', error.message);
    console.error(error.stack);
  }
}

runTest(); 