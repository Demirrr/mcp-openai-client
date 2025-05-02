# MCP OpenAI Client

A TypeScript-based client for interacting with Hugging Face's Model Context Protocol (MCP) and OpenAI-compatible endpoints.

## Features

- Integration with Hugging Face's Model Context Protocol
- Support for OpenAI-compatible endpoints
- Tool-based agent architecture
- Interactive CLI interface
- Support for multiple MCP servers (filesystem, Playwright)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- TypeScript

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Demirrr/mcp-openai-client
cd mcp-openai-client
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Configuration

1. Set up your environment variables:
```bash
export HF_TOKEN="your-huggingface-token"
```

2. (Optional) Configure your provider and model in `index.ts`:
```typescript
const PROVIDER = "your-provider-url";
const MODEL_ID = "your-model-id";
```

## Usage

### Building & Running the CLI

```bash
npm run build && npm start
```
```

### Building a Standalone Binary

To create a standalone executable:

1. Install pkg globally:
```bash
npm install -g pkg
```

2. Build the binary:
```bash
pkg dist/index.js --targets node18-linux-x64 --output llm-cli
```

3. Run the binary:
```bash
./llm-cli
```

## Development

### Project Structure

```
mcp-openai-client/
├── src/
│   ├── Agent.ts       # Agent implementation
│   ├── McpClient.ts   # MCP client implementation
│   └── util.ts        # Utility functions
├── index.ts           # Main entry point
├── package.json       # Project configuration
└── tsconfig.json      # TypeScript configuration
```

### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled application
- `npm test` - Run tests (when implemented)

## MCP Servers

The client supports multiple MCP servers:

1. Filesystem Server
   - Provides access to local filesystem
   - Configured to access the Desktop directory

2. Playwright Server
   - Enables web automation capabilities
   - Latest version from npm

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.





npm install -g typescript
npm init -y # initialize a package.json
npm install typescript --save-dev # install typeScript
npx tsc --init
npx tsc && node index.js

After adding
"scripts": {
  "build": "tsc",
  "start": "node dist/index.js"
}


npm run build && npm start



npm install -g pkg

pkg dist/index.js --targets node18-linux-x64 --output llm-cli

./llm-cli

