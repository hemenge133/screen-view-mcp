import fs from 'fs';
import path from 'path';
import screenshot from 'screenshot-desktop';
import { logInfo, logError } from '../utils/logger';

/**
 * Captures a screenshot of the entire desktop
 * 
 * @returns Promise<string> Base64-encoded image data
 */
export async function captureScreenshot(): Promise<string> {
  try {
    logInfo('Capturing full screen screenshot');
    
    // Capture screenshot as Buffer
    const screenshotBuffer = await screenshot();
    
    // Convert Buffer to Base64 string
    const base64Image = screenshotBuffer.toString('base64');
    
    logInfo('Screenshot captured successfully');
    return base64Image;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError('Failed to capture screenshot', { error: errorMessage });
    throw new Error(`Screenshot capture failed: ${errorMessage}`);
  }
}

/**
 * Saves a base64 image to a file (for debugging/testing)
 * 
 * @param base64Image Base64-encoded image data
 * @param filePath Path to save the image file
 */
export async function saveScreenshotToFile(base64Image: string, filePath: string = './screenshot.png'): Promise<void> {
  try {
    // Create the directory if it doesn't exist
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Convert Base64 to Buffer and save to file
    const imageBuffer = Buffer.from(base64Image, 'base64');
    fs.writeFileSync(filePath, imageBuffer);
    
    logInfo(`Screenshot saved to ${filePath}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError('Failed to save screenshot to file', { error: errorMessage, filePath });
    throw new Error(`Failed to save screenshot: ${errorMessage}`);
  }
}