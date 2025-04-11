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

## Development

Build the project:
```bash
npm run build
```

Run tests:
```bash
npm test
```

## License

MIT