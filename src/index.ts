import 'dotenv/config';
import { startServer } from './server';

// Verify API key is configured
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY is not set. Please add it to your .env file');
  process.exit(1);
}

// Start the MCP server
startServer().catch(error => {
  console.error('Server error:', error);
  process.exit(1);
});
