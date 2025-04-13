# Screen View MCP

[![smithery badge](https://smithery.ai/badge/@hemenge133/screen-view-mcp)](https://smithery.ai/server/@hemenge133/screen-view-mcp)

A Model Context Protocol (MCP) tool for capturing screenshots and analyzing them using Claude Vision API.

## Features

- Captures full-screen screenshots
- Analyzes screenshots with Claude Vision API
- Provides detailed descriptions of screen content
- Integrates with AI code editors and assistants via MCP
- Automated configuration setup from environment variables

## Prerequisites

- Node.js v16+ (v18+ recommended)
- An Anthropic API key for Claude

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/screen-view-mcp.git
cd screen-view-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the TypeScript code:
```bash
npm run build
```

## API Key Configuration

The recommended way to configure your Anthropic API key is through environment variables:

1. Create a `.env` file:
```bash
cp .env.example .env
```

2. Edit the `.env` file to add your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

3. Generate MCP configuration:
```bash
node generate-mcp-config.mjs
```

This will automatically create the necessary MCP configuration file (`.cursor/mcp.json`) using your API key from the `.env` file.

### Manual Configuration Options

If you prefer to manually configure the tool, you can create the appropriate configuration file for your environment:

#### Cursor IDE
Create/edit `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "screen-view-mcp": {
      "command": "node",
      "args": [
        "<absolute_path_to>/screenshot-mcp-server.mjs",
        "--api-key=sk-ant-api03-your-key-here"
      ],
      "transport": "stdio"
    }
  }
}
```

#### Claude Desktop
Create configuration at `~/.config/claude-desktop/mcp.json` (Linux/macOS) or `%APPDATA%\claude-desktop\mcp.json` (Windows):
```json
{
  "mcpServers": {
    "screen-view-mcp": {
      "command": "node",
      "args": [
        "<absolute_path_to>/screenshot-mcp-server.mjs",
        "--api-key=sk-ant-api03-your-key-here"
      ],
      "transport": "stdio"
    }
  }
}
```

**Important Security Notes:**
- Never commit your API key to version control
- Use appropriate file permissions to protect configuration files containing API keys
- Consider using environment variables or a secure secrets manager in production environments

## Usage

### Testing the Tool

To test the screenshot functionality:

```bash
node test-screenshot.mjs
```

This will:
- Capture a screenshot
- Save it to `test-screenshot.png`
- Analyze it with Claude Vision if an API key is available

### Using with AI Assistants

The tool can be invoked with prompts like:
```
I want to analyze what's on my screen right now
```

The tool accepts these parameters:
- `prompt`: Custom prompt to send to Claude (default: "What do you see in this screenshot?")
- `modelName`: Claude model to use (default: gpt-4-vision-preview)
- `saveScreenshot`: Whether to save a copy of the screenshot (default: false)

## Development

Build the project:
```bash
npm run build
```

Run tests:
```bash
npm test
```

## Troubleshooting

Common issues and solutions:

1. **API Key Not Found**
   - Check that your API key is correctly set in the `.env` file
   - Run `node generate-mcp-config.mjs` to regenerate the configuration
   - Verify the API key format starts with `sk-ant-api03-`
   - Ensure configuration files have correct permissions

2. **MCP Server Issues**
   - Verify the absolute path in your MCP configuration is correct
   - Check that you've built the project with `npm run build`
   - Try running the server directly: `node screenshot-mcp-server.mjs --api-key=your-key`
   - Check error logs in your AI assistant's log files

3. **Screenshot Capture Fails**
   - Ensure you have appropriate screen capture permissions
   - Try running with elevated privileges if needed
   - Check system screenshot capabilities

## License

MIT
