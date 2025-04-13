import fs from 'fs';
import path from 'path';
import screenshot from 'screenshot-desktop';

/**
 * Captures a screenshot and returns it as a base64 string
 */
export async function captureScreenshot(): Promise<string> {
  try {
    // Capture the screenshot buffer
    const buffer = await screenshot();

    // Log buffer info for debugging
    console.log('Debug: Screenshot buffer length:', buffer.length);

    // Check file signature/magic numbers to determine file type
    let fileType = 'unknown';
    if (buffer.length > 4) {
      // Check PNG signature (89 50 4E 47)
      if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
        fileType = 'PNG';
      }
      // Check JPEG signature (FF D8 FF)
      else if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        fileType = 'JPEG';
      }
      // Check BMP signature (42 4D)
      else if (buffer[0] === 0x42 && buffer[1] === 0x4d) {
        fileType = 'BMP';
      }
    }

    console.log('Debug: Detected file type:', fileType);
    console.log(
      'Debug: First 8 bytes:',
      Array.from(buffer.slice(0, 8))
        .map(b => '0x' + b.toString(16).padStart(2, '0'))
        .join(' ')
    );

    // Save a debug copy of the raw screenshot
    const debugDir = path.join(process.cwd(), 'debug');
    if (!fs.existsSync(debugDir)) {
      fs.mkdirSync(debugDir, { recursive: true });
    }
    const debugPath = path.join(debugDir, `raw_screenshot_${Date.now()}.png`);
    fs.writeFileSync(debugPath, buffer);
    console.log(`Debug: Raw screenshot saved to ${debugPath}`);

    // Convert to base64
    const base64Data = buffer.toString('base64');

    // Also save the base64 for debugging
    fs.writeFileSync(path.join(debugDir, 'last_base64.txt'), base64Data);

    return base64Data;
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    throw error;
  }
}

/**
 * Saves a base64 image to a file
 * @param base64Image - The base64 string of the image
 * @param filePath - The path where to save the file
 */
export async function saveScreenshotToFile(base64Image: string, filePath: string): Promise<void> {
  try {
    // Create directory if it doesn't exist
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Remove data URI prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');

    // Convert base64 to buffer and save directly
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);
    console.log(`Screenshot saved to ${filePath}`);
  } catch (error) {
    console.error('Error saving screenshot:', error);
    throw error;
  }
}
