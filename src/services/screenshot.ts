import fs from 'fs';
import path from 'path';
import screenshot from 'screenshot-desktop';

/**
 * Captures a screenshot and returns it as a base64 string
 */
export async function captureScreenshot(): Promise<string> {
  const buffer = await screenshot();
  return buffer.toString('base64');
}

/**
 * Saves a base64 image to a file
 * @param base64Image - The base64 string of the image
 * @param filePath - The path where to save the file
 */
export async function saveScreenshotToFile(base64Image: string, filePath: string): Promise<void> {
  // Create directory if it doesn't exist
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Convert base64 to buffer and save
  const buffer = Buffer.from(base64Image, 'base64');
  fs.writeFileSync(filePath, buffer);
} 