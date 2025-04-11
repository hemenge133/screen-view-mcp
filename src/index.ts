import 'dotenv/config';
import { createMCPServer } from './services/mcp';
import { logInfo, logError } from './utils/logger';
import { captureScreenshot } from './services/screenshot';
import { analyzeImage } from './services/vision';
import readline from 'readline';

// Verify that the API key is configured
if (!process.env.ANTHROPIC_API_KEY) {
  logError('ANTHROPIC_API_KEY is not set. Please add it to your .env file');
  process.exit(1);
}

/**
 * Main function that either starts the MCP server or runs in direct mode
 */
async function main() {
  // Check if running in MCP server mode or direct mode
  const useServer = process.argv.includes('--server');
  
  if (useServer) {
    // Start MCP server
    logInfo('Starting MCP server mode');
    const server = createMCPServer();
    
    server.listen(3000, () => {
      logInfo('MCP Server is running on port 3000');
    });
  } else {
    // Run in direct mode (interactive CLI)
    logInfo('Starting in direct mode');
    await directMode();
  }
}

/**
 * Interactive command-line interface for direct usage
 */
async function directMode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\n📸 Screen View - Direct Mode');
  console.log('==========================');
  
  async function promptUser() {
    console.log('\nOptions:');
    console.log('1. Capture and analyze screen');
    console.log('2. Exit');
    
    rl.question('\nChoose an option (1-2): ', async (answer) => {
      switch (answer.trim()) {
        case '1':
          rl.question('Enter prompt for analysis (press Enter for default): ', async (prompt) => {
            try {
              console.log('\nCapturing and analyzing screen...');
              
              // Capture screenshot
              const screenshot = await captureScreenshot();
              
              // Analyze with Claude
              const analysis = await analyzeImage(
                screenshot,
                prompt || 'What do you see in this screenshot? Describe it in detail.',
                'claude-3-opus-20240229'
              );
              
              console.log('\n✅ ANALYSIS:');
              console.log('-------------------');
              console.log(analysis);
              console.log('-------------------');
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              console.error(`\n❌ ERROR: ${errorMessage}`);
            }
            
            promptUser();
          });
          break;
          
        case '2':
          console.log('Exiting. Goodbye!');
          rl.close();
          process.exit(0);
          break;
          
        default:
          console.log('Invalid option. Please try again.');
          promptUser();
      }
    });
  }
  
  // Start the prompt loop
  promptUser();
}

// Start the application
main().catch(error => {
  logError('Application error', { error: error instanceof Error ? error.message : 'Unknown error' });
  process.exit(1);
});