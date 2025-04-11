import { jest } from '@jest/globals';\nimport fs from 'fs';\nimport { captureScreenshot, saveScreenshotToFile } from '../services/screenshot';\n\n// Mock the screenshot-desktop module\njest.mock('screenshot-desktop', () => {\n  return jest.fn().mockResolvedValue(Buffer.from('mocked-screenshot-data'));\n});\n\n// Mock fs module\njest.mock('fs', () => ({\n  writeFileSync: jest.fn(),\n  existsSync: jest.fn().mockReturnValue(true),\n  mkdirSync: jest.fn(),\n}));\n\ndescribe('Screenshot Service', () => {\n  beforeEach(() => {\n    jest.clearAllMocks();\n  });\n\n  describe('captureScreenshot', () => {\n    it('should capture screenshot and return base64 string', async () => {\n      const base64Screenshot = await captureScreenshot();\n      \n      // Verify we get back the expected base64 string\n      expect(base64Screenshot).toBe('bW9ja2VkLXNjcmVlbnNob3QtZGF0YQ=='); // Base64 of 'mocked-screenshot-data'\n      \n      // Verify screenshot-desktop was called\n      const screenshot = require('screenshot-desktop');\n      expect(screenshot).toHaveBeenCalledTimes(1);\n    });\n  });\n\n  describe('saveScreenshotToFile', () => {\n    it('should save base64 image to a file', async () => {\n      const base64Image = 'dGVzdC1pbWFnZS1kYXRh'; // 'test-image-data' in base64\n      const filePath = './test-screenshot.png';\n      \n      await saveScreenshotToFile(base64Image, filePath);\n      \n      // Check that writeFileSync was called with correct args\n      expect(fs.writeFileSync).toHaveBeenCalledWith(\n        filePath,\n        expect.any(Buffer)\n      );\n      \n      // Verify buffer contains the expected data\n      const bufferArg = (fs.writeFileSync as jest.Mock).mock.calls[0][1];\n      expect(bufferArg.toString()).toBe('test-image-data');\n    });\n\n    it('should create directory if it does not exist', async () => {\n      // Mock existsSync to return false to test directory creation\n      (fs.existsSync as jest.Mock).mockReturnValueOnce(false);\n      \n      await saveScreenshotToFile('dGVzdA==', './nonexistent/path/image.png');\n      \n      expect(fs.mkdirSync).toHaveBeenCalledWith('./nonexistent/path', { recursive: true });\n    });\n  });\n});\n