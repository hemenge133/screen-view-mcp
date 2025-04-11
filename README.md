# Screen View MCP

A TypeScript application that captures your screen and analyzes it using Claude 3 Opus vision model via the Model Context Protocol (MCP) SDK.

## Features

- Full screen capture using `screenshot-desktop`
- Image analysis using Claude 3 Opus vision model
- Integration with the Model Context Protocol SDK

## Prerequisites

- Node.js v16 or higher
- An Anthropic API key (for Claude 3 Opus)

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/hemenge133/screen-view-mcp.git
   cd screen-view-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from the template:
   ```bash
   cp .env.example .env
   ```

4. Add your Anthropic API key to the `.env` file:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

## Usage

Start the application:

```bash
npm run dev
```

This will:
1. Capture your screen
2. Send the screenshot to Claude 3 Opus
3. Display the AI's analysis of what's on your screen

## Integration with Cursor (MCP)

To use this MCP server with Cursor:

### Project-level Configuration (recommended)

1. The repository includes a `.cursor/mcp.json` file that configures the MCP server for this project.
2. Edit the file to add your Anthropic API key:
   ```json
   {
     "mcpServers": {
       "screen-view-mcp": {
         "command": "node",
         "args": ["minimal-mcp-server.js"],
         "env": {
           "ANTHROPIC_API_KEY": "your_api_key_here"
         }
       }
     }
   }
   ```
3. Build the project before using it with Cursor:
   ```bash
   npm run build
   ```
4. Open the project in Cursor, and the MCP server will be automatically available to the Cursor Agent.

### Using the Minimal Server

This project now includes a simpler and more reliable implementation of the MCP server in `minimal-mcp-server.js`. This implementation:

- Uses the latest MCP SDK API with the `McpServer` class
- Properly handles the MCP protocol responses
- Connects via the stdio transport for compatibility with Cursor

To run the minimal server directly:

```bash
node minimal-mcp-server.js
```

### Global Configuration (optional)

To make this MCP server available across all projects:

1. Create a `~/.cursor/mcp.json` file in your home directory with the following content:
   ```json
   {
     "mcpServers": {
       "screen-view-mcp": {
         "command": "node",
         "args": ["path/to/screen-view-mcp/minimal-mcp-server.js"],
         "env": {
           "ANTHROPIC_API_KEY": "your_api_key_here"
         }
       }
     }
   }
   ```
2. Replace `path/to/screen-view-mcp` with the absolute path to your cloned repository.

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

If you encounter issues with the MCP server:

1. Make sure your Anthropic API key is correctly set in the `.env` file
2. Check that you've built the project with `npm run build` before running
3. Ensure you're using the correct server implementation (`minimal-mcp-server.js`)
4. If you're still having issues, try running the server directly with `node minimal-mcp-server.js` to see any error output

## License

MIT