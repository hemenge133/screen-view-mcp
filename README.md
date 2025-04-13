# 📸 screen-view-mcp

[![Node.js 18+](https://img.shields.io/badge/node-18%2B-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Code style: prettier](https://img.shields.io/badge/code%20style-prettier-f8bc45.svg)](https://prettier.io/)
[![smithery badge](https://smithery.ai/badge/@hemenge133/screen-view-mcp)](https://smithery.ai/protocol/@hemenge133/screen-view-mcp)

A powerful Model Context Protocol (MCP) tool that enables AI assistants to capture and analyze screenshots using Claude Vision API. Take screenshots, analyze screen content, and get AI insights about your desktop interface. 

## ✨ Features

- 📸 Instant full-screen screenshot capture
- 🔍 AI-powered scene analysis with Claude Vision
- 🤖 Seamless integration with MCP-compatible AI assistants
- 🛠️ Easy configuration and setup

### 🎯 Use Cases

- Capture and analyze screenshots of your desktop
- Analyze UI elements and layouts
- Debug visual issues with screen captures
- Get AI insights about screen content
- Document interface elements and layouts
- Screen recording and analysis
- Desktop automation with visual feedback

## 🚀 Quickstart

### Installing via Smithery

The easiest way to install Screen View MCP is through Smithery:

```bash
# For Claude Desktop
npx @smithery/cli install @hemenge133/screen-view-mcp --client claude --env.anthropicApiKey=your-api-key

# For Cursor
npx @smithery/cli install @hemenge133/screen-view-mcp --client cursor --env.anthropicApiKey=your-api-key

# For CLIne
npx @smithery/cli install @hemenge133/screen-view-mcp --client cline --env.anthropicApiKey=your-api-key

# For Windsurf
npx @smithery/cli install @hemenge133/screen-view-mcp --client windsurf --env.anthropicApiKey=your-api-key
```

You can also run it directly through Smithery:

```bash
npx @smithery/cli run @hemenge133/screen-view-mcp --env.anthropicApiKey=your-api-key
```

This will automatically:
1. Install the package
2. Configure your AI client
3. Set up environment variables

### Manual Installation

1. Install the package:
```bash
# Install the latest version
npm install -g screen-view-mcp

# To ensure you get the exact latest version and avoid caching issues
npm install -g screen-view-mcp@2.0.14  # Replace with latest version number
```

2. Add to your AI client config file:

**Claude Desktop**:
- Windows: `%APPDATA%/Claude/claude_desktop_config.json`  
- MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Cursor**:
- Windows: `%APPDATA%/Cursor/mcp.json`
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
        "screen-view-mcp@2.0.14"  // Specify exact version to avoid caching issues
      ],
      "transport": "stdio",
      "env": {
        "ANTHROPIC_API_KEY": "your-anthropic-api-key"
      }
    }
  }
}
```

### Troubleshooting Installation Issues

If you encounter problems with the npm installation (such as "Invalid file signature" errors):

1. Try installing with an explicit version number:
```bash
npm install -g screen-view-mcp@2.0.14  # Replace with latest version number
```

2. Clear npm cache and reinstall:
```bash
npm cache clean --force
npm install -g screen-view-mcp@2.0.14
```

3. Install directly from a local tarball:
```bash
# Create a local package file
npm pack

# Install from the local file
npm install -g ./screen-view-mcp-2.0.14.tgz
```

## 📝 Available Tool

### mcp_screen_view_mcp_captureAndAnalyzeScreen

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
node dist/index.js --api-key=your-anthropic-api-key
```

## 📜 License

MIT