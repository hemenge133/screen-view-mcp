import { jest } from '@jest/globals';
import fs from 'fs';
import { captureScreenshot, saveScreenshotToFile } from '../services/screenshot';

// Mock the screenshot-desktop module
jest.mock('screenshot-desktop', () => {
  return jest.fn().mockResolvedValue(Buffer.from('mocked-screenshot-data'));
});

// Mock fs module
jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
}));

describe('Screenshot Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('captureScreenshot', () => {
    it('should capture screenshot and return base64 string', async () => {
      const base64Screenshot = await captureScreenshot();

      // Verify we get back the expected base64 string
      expect(base64Screenshot).toBe('bW9ja2VkLXNjcmVlbnNob3QtZGF0YQ=='); // Base64 of 'mocked-screenshot-data'

      // Verify screenshot-desktop was called
      const screenshot = require('screenshot-desktop');
      expect(screenshot).toHaveBeenCalledTimes(1);
    });
  });

  describe('saveScreenshotToFile', () => {
    it('should save base64 image to a file', async () => {
      const base64Image = 'dGVzdC1pbWFnZS1kYXRh'; // 'test-image-data' in base64
      const filePath = './test-screenshot.png';

      await saveScreenshotToFile(base64Image, filePath);

      // Check that writeFileSync was called with correct args
      expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, expect.any(Buffer));

      // Verify buffer contains the expected data
      const bufferArg = (fs.writeFileSync as jest.Mock).mock.calls[0][1];
      expect(bufferArg.toString()).toBe('test-image-data');
    });

    it('should create directory if it does not exist', async () => {
      // Mock existsSync to return false to test directory creation
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false);

      const base64Image = 'dGVzdC1pbWFnZS1kYXRh';
      const filePath = './nonexistent/path/image.png';

      await saveScreenshotToFile(base64Image, filePath);

      expect(fs.mkdirSync).toHaveBeenCalledWith('./nonexistent/path', { recursive: true });
    });
  });
});
