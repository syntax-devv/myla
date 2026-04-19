# Myla

A unified terminal interface that initializes AI engines (Claude, Codex, and custom APIs) through a single, consistent command-line experience. No more switching between different CLIs with different interfaces—one tool, multiple brains.

## The Problem

- Claude Code CLI, OpenAI Codex CLI, and custom API endpoints each have their own interface
- Switching contexts breaks flow
- Session history is scattered across tools
- No unified way to route queries to the best engine for the job

## The Solution

Myla: a single terminal interface that:
- Routes your requests to the appropriate AI engine based on context or explicit choice
- Maintains unified session history across all engines
- Offers consistent commands and keybindings regardless of backend
- Allows switching engines mid-session without losing context

## Architecture

```
┌─────────────────────────────────────────┐
│               Shell Layer                │  ← Ink/React terminal UI
│  (ScrollView, Input, Theme Engine)       │
├─────────────────────────────────────────┤
│               Brain Layer                │  ← Core orchestration
│  (Engine Router, History Manager,      │
│   Config Manager)                       │
├─────────────────────────────────────────┤
│              Driver Layer                │  ← External adapters
│  (ClaudeAdapter, CodexAdapter,         │
│   APIAdapter)                           │
└─────────────────────────────────────────┘
```

## Quick Start

```bash
# Install dependencies
npm install

# Start the orchestrator
npm start
```

## Commands

Once running:
- `your query here` → Routes to default engine
- `/claude <message>` → Send to Claude specifically
- `/codex <message>` → Send to Codex specifically
- `/engines` → List available engines
- `/status` → Show current status
- `/help` → Show all commands
- `/quit` → Exit and save session

## Project Structure

```
src/
├── index.jsx              # Entry point
├── shell/                 # UI layer
│   ├── App.jsx            # Main app component
│   ├── theme.js           # Theme engine
│   └── components/        # Reusable UI components
│       ├── ScrollView.jsx
│       └── Input.jsx
├── brain/                 # Core logic
│   ├── engine.js          # Engine router
│   └── history.js         # Session persistence
├── driver/                # External service adapters
│   ├── apiBase.js         # Base adapter interface
│   ├── claudeAdapter.js   # Claude Code CLI adapter
│   ├── codexAdapter.js    # OpenAI Codex adapter
│   └── index.js           # Adapter factory
└── utils/                 # Shared utilities
    └── config.js          # Config manager (~/.myla/)
```

## Configuration

Config lives at `~/.myla/config.json`:

```json
{
  "defaultEngine": "claude",
  "theme": "dark",
  "engines": {
    "claude": { "enabled": true },
    "codex": { "enabled": false },
    "api": { "enabled": false, "endpoint": null }
  }
}
```

## Session History

All conversations are saved to `~/.myla/sessions/` as JSON files. Sessions are automatically timestamped and can be loaded later.

## Development

Requirements:
- Node.js 18+
- Claude CLI or Codex CLI (optional, depending on which engines you enable)

```bash
# Run in dev mode
npm run dev

# Install as global CLI
npm link
myla
```

## Roadmap

- [x] Phase 1: Basic shell, engine router, adapters
- [ ] Phase 2: Multi-engine sessions, context passing
- [ ] Phase 3: Plugin system for custom adapters
- [ ] Phase 4: Remote API endpoints, authentication
