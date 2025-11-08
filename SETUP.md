# Quick Setup Guide

This guide will help you get the Bar Assistant MCP Server running in under 5 minutes.

## Prerequisites Check

Before starting, ensure you have:

```bash
node --version  # Should be 18 or higher
npm --version   # Any recent version
```

If you don't have Node.js installed, download it from [nodejs.org](https://nodejs.org/).

## Step 1: Installation

```bash
# Clone the repository
git clone <your-repository-url>
cd bar-assistant-mcp-server

# Install dependencies
npm install

# Build the server
npm run build
```

## Step 2: Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your Bar Assistant credentials:

```bash
BAR_ASSISTANT_URL=https://your-bar-assistant-instance.com/bar
BAR_ASSISTANT_TOKEN=your-api-token-here
BAR_ASSISTANT_BAR_ID=1
```

### Getting Your API Token

1. Log into your Bar Assistant instance
2. Go to **Settings** → **API**
3. Click **Generate new token**
4. Copy the token and paste it into your `.env` file

## Step 3: Test

Verify everything works:

```bash
npm test
```

You should see:
```
🍸 Starting Bar Assistant MCP Server Tests
✅ PASSED: API Connectivity Test
✅ PASSED: Search Cocktails Test
✅ PASSED: Negroni Recommendations Test
...
🎉 All tests passed!
```

## Step 4: MCP Client Configuration

### For VS Code

Create `.vscode/mcp.json` (copy from `.vscode/mcp.json.example`):

```jsonc
{
  "servers": {
    "bar-assistant": {
      "command": "node",
      "args": ["dist/src/bar-assistant-mcp-server.js"],
      "env": {
        "BAR_ASSISTANT_URL": "https://your-instance.com/bar",
        "BAR_ASSISTANT_TOKEN": "your-api-token",
        "BAR_ASSISTANT_BAR_ID": "1"
      }
    }
  }
}
```

### For Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```jsonc
{
  "mcpServers": {
    "bar-assistant": {
      "command": "node",
      "args": ["/absolute/path/to/bar-assistant-mcp-server/dist/src/bar-assistant-mcp-server.js"],
      "env": {
        "BAR_ASSISTANT_URL": "https://your-instance.com/bar",
        "BAR_ASSISTANT_TOKEN": "your-api-token",
        "BAR_ASSISTANT_BAR_ID": "1"
      }
    }
  }
}
```

**Important:** Use the absolute path to the compiled server file.

## Step 5: Try It Out!

Once configured, try these example queries with your MCP client:

- *"Show me cocktails similar to a Negroni"*
- *"How do I make a Manhattan?"*
- *"What cocktails can I make with gin and vermouth?"*
- *"Find me some bitter cocktails"*

## Troubleshooting

### Tests fail with authentication error

- Double-check your `BAR_ASSISTANT_URL` ends with `/bar`
- Verify your API token is correct and hasn't expired
- Ensure your Bar Assistant instance is accessible

### "Cannot find module" errors

```bash
# Rebuild the project
rm -rf dist
npm run build
```

### MCP client can't connect

1. Verify the path to `dist/src/bar-assistant-mcp-server.js` is correct
2. Check environment variables are set in the MCP config
3. Restart your MCP client application

## Next Steps

- Read the full [README.md](README.md) for detailed features
- Explore the available tools and their parameters

## Need Help?

- Check the [README.md](README.md) for detailed documentation
- Review test examples in `test/run-tests.ts`

---

You're all set! 🎉 Start exploring cocktails with natural language queries!
