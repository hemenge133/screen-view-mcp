# 📸 screen-view-mcp

[![Node.js 18+](https://img.shields.io/badge/node-18%2B-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Code style: prettier](https://img.shields.io/badge/code%20style-prettier-f8bc45.svg)](https://prettier.io/)

A powerful Model Context Protocol (MCP) tool that enables AI assistants to capture and analyze screenshots using Claude Vision API. Take screenshots, analyze screen content, and get AI insights about your desktop interface. 

## ✨ Features

- 📸 Instant full-screen screenshot capture
- 🔍 AI-powered scene analysis with Claude Vision
- 🤖 Seamless integration with MCP-compatible AI assistants
- 🛠️ Easy configuration and setup
- 🔄 Support for both stdio and SSE transports

### 🎯 Use Cases

- Capture and analyze screenshots of your desktop
- Analyze UI elements and layouts
- Debug visual issues with screen captures
- Get AI insights about screen content
- Document interface elements and layouts
- Screen recording and analysis
- Desktop automation with visual feedback

## 🚀 Quickstart

### Installing via npm (Recommended)

The most reliable way to install Screen View MCP is through npm:

```bash
# Install the latest version
npm install -g screen-view-mcp

# To ensure you get the exact latest version and avoid caching issues
npm install -g screen-view-mcp@2.0.15  # Replace with latest version number
```

Then configure your AI client as shown in the "Manual Configuration" section below.

### Manual Configuration

After installing via npm, configure your AI client:

#### For stdio transport (default)

**Claude Desktop**:
- Windows: `%APPDATA%/Claude/claude_desktop_config.json`  
- MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Cursor**:
- Windows: `%APPDATA%/Cursor/mcp.json` or `~/.cursor/mcp.json`
- MacOS: `~/Library/Application Support/Cursor/mcp.json`

**CLIne**:
- `~/.config/cline/mcp.json`

**Windsurf**:
- `~/.config/windsurf/mcp.json`

```json
{
  "mcpServers": {
    "screen-view-mcp": {
      "command": "npx",
      "args": [
        "screen-view-mcp@2.0.15"  // Specify exact version to avoid caching issues
      ],
      "transport": "stdio",
      "env": {
        "ANTHROPIC_API_KEY": "your-anthropic-api-key"
      }
    }
  }
}
```

#### For SSE transport

For clients that support SSE transport or for remote connection scenarios:

```json
{
  "mcpServers": {
    "screen-view-mcp": {
      "command": "npx",
      "args": [
        "screen-view-mcp@2.0.15",
        "--sse",
        "--port", "8080",
        "--host", "localhost"
      ],
      "env": {
        "ANTHROPIC_API_KEY": "your-anthropic-api-key"
      }
    }
  }
}
```

For connecting to a remote SSE server (running on another machine):

```json
{
  "mcpServers": {
    "screen-view-mcp": {
      "url": "http://your-server-ip:8080/sse",
      "transport": "sse",
      "env": {
        "ANTHROPIC_API_KEY": "your-anthropic-api-key"
      }
    }
  }
}
```

## 📝 Available Tools

### captureAndAnalyzeScreen

Captures and analyzes the current screen content.

Parameters:
```typescript
{
  prompt?: string;      // Custom prompt for analysis
  modelName?: string;   // Claude model to use
  saveScreenshot?: boolean; // Save screenshot locally
}
```

Example usage in Claude:
```
Can you analyze what's on my screen right now and describe the layout?
```

## Troubleshooting

### Common Issues

- **No access to screen capture**: Make sure your AI client has screen capture permissions
- **API key errors**: Verify your Anthropic API key is valid and properly set in the configuration
- **MCP tool not found**: Ensure the package is installed globally (`npm list -g screen-view-mcp`)
- **Package version issues**: Specify the exact version in your configuration to avoid caching problems
- **Transport issues**: Confirm that you're using the right transport mode for your client
  - For Claude Desktop, use stdio transport (default)
  - For clients supporting SSE, you can use the `--sse` flag

### Transport Compatibility

Here are the transport types supported by different clients:

| Client         | Supported Transports |
|----------------|----------------------|
| Claude Desktop | stdio                |
| Cursor         | stdio, SSE           |
| Cline          | stdio, SSE           |
| Windsurf       | stdio, SSE           |

If you see connection errors, make sure you're using the correct transport configuration for your client.

## 🔧 Development

1. Clone and install:
```bash
git clone https://github.com/yourusername/screen-view-mcp.git
cd screen-view-mcp
npm install
```

2. Build:
```bash
npm run build
```

3. Test locally:
```bash
# Test with stdio transport (default)
node dist/screen-capture-mcp.js --api-key=your-anthropic-api-key

# Test with SSE transport
node dist/screen-capture-mcp.js --sse --port 8080 --host localhost --api-key=your-anthropic-api-key
```

## 📜 License

MIT

## Smithery Deployment

This project is configured for deployment on Smithery, which allows hosting the MCP server over WebSocket transport.

### Deployment Requirements

- Dockerfile (included in repository)
- smithery.yaml (included in repository)
- Anthropic API Key (required during configuration)

### Deployment Steps

1. Add the server to Smithery
2. Access the Deployments tab
3. Configure with your Anthropic API Key
4. Deploy the server

### Configuration Options

- `anthropicApiKey` (required): Your Anthropic API key
- `verbose` (optional): Enable verbose logging (default: false)

## Available Tools

- `helloWorld`: Simple test tool that echoes a message
- `captureAndAnalyzeScreen`: Captures a screenshot and analyzes it using Claude Vision

## Usage Examples

### Capturing and Analyzing a Screenshot

```javascript
const response = await mcpClient.invoke("captureAndAnalyzeScreen", {
  prompt: "What's on my screen right now? Focus on the main content.",
  modelName: "claude-3-opus-20240229"
});
console.log(response);
```