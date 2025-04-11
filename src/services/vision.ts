import { Anthropic } from '@anthropic-ai/sdk';
import { logInfo, logError } from '../utils/logger';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Error type for Anthropic API errors
interface AnthropicError extends Error {
  status?: number;
  error?: any;
}

/**
 * Analyze an image using Claude Vision API
 * 
 * @param imageBase64 Base64-encoded image data
 * @param prompt User prompt for image analysis
 * @param model Model to use (default: claude-3-opus-20240229)
 * @returns The analysis result text
 */
export async function analyzeImage(
  imageBase64: string, 
  prompt: string = 'What do you see in this image? Describe it in detail.', 
  model: string = 'claude-3-opus-20240229'
): Promise<string> {
  try {
    logInfo('Analyzing image with Claude Vision API', { model });
    
    // Ensure the prompt is not empty
    if (!prompt || prompt.trim() === '') {
      prompt = 'What do you see in this image? Describe it in detail.';
    }
    
    // Handle model name to ensure correct format
    const modelName = model.startsWith('claude-') ? model : 'claude-3-opus-20240229';

    // Call Claude Vision API
    const response = await anthropic.messages.create({
      model: modelName,
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
                data: imageBase64,
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

    // Extract and return the analysis text
    const analysisText = response.content
      .filter(item => item.type === 'text')
      .map(item => 'text' in item ? item.text : '')
      .join('\n');
    
    logInfo('Image analysis complete');
    return analysisText;
  } catch (error) {
    const err = error as AnthropicError;
    const errorMessage = err.message || 'Unknown error';
    
    logError('Error analyzing image with Claude', { 
      error: errorMessage,
      status: err.status,
      details: err.error
    });
    
    if (err.status === 429) {
      throw new Error(`Rate limit exceeded: ${errorMessage}`);
    } else if (err.status === 401) {
      throw new Error('Authentication error: Please check your Anthropic API key');
    } else {
      throw new Error(`Failed to analyze image: ${errorMessage}`);
    }
  }
}