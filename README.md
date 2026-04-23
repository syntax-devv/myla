# Myla

Terminal AI orchestrator with React Ink - a powerful CLI tool for managing multiple AI engines with a modern, themeable interface.

## Features

- **Multi-Engine Support**: Manage Claude, Codex, and other AI providers from a single interface
- **Theme System**: Built-in themes (Default Dark/Light, Monokai, Dracula, Nord) with agent-specific styling
- **Git Integration**: Real-time git status display in the status bar
- **Mode Indicators**: Visual indicators for chat/edit/command modes
- **Project-Scoped Runtime**: Isolated runtime directories per project
- **Error Handling**: Graceful error handling with user-friendly messages
- **Session Management**: Persistent session history with database storage

## Installation

```bash
npm install
npm run build
npm start
```

## Configuration

### Environment Variables

Configure Myla behavior using `MYLA_*` environment variables:

- `MYLA_STATUS_INTERVAL` - Status bar refresh rate in seconds (1-60, default: varies)
- `MYLA_THEME_COLORS` - JSON object with custom color scheme
- `MYLA_MAX_LINES` - Maximum lines in output buffer (100-100000, default: 10000)
- `MYLA_RUNTIME_DIR` - Custom runtime directory path
- `MYLA_DEBUG` - Enable debug mode (1/true)

Example:
```bash
MYLA_MAX_LINES=5000 MYLA_DEBUG=1 npm start
```

### Engine Configuration

Configure AI engines in `~/.myla/config.toml`:

```toml
[engines.claude]
path = "/path/to/claude"
args = ["--model", "claude-3-opus"]

[engines.codex]
path = "/path/to/codex"
```

## Theme System

### Built-in Themes

- **Default Dark** - Modern dark theme with blue accents
- **Default Light** - Clean light theme
- **Monokai** - Classic Monokai color scheme
- **Dracula** - Popular Dracula theme
- **Nord** - Arctic, north-bluish color palette

### Theme Configuration

Themes are stored in project-scoped runtime directories: `~/.myla/runtime/project-{hash}/theme.json`

### Agent-Specific Styling

Customize colors per AI provider programmatically using the `useTheme` hook.

## Architecture

### Terminal Backend Abstraction

Myla uses a pluggable terminal backend system:

- `TerminalBackend` interface - Abstract terminal operations
- `PtyBackend` - node-pty implementation
- `BackendFactory` - Backend selection and caching

### Provider Catalog

Extensible provider system for AI engines:

- `ProviderManifest` - Provider metadata and capabilities
- `ProviderCatalog` - Provider registration and lookup
- `BUILTIN_PROVIDERS` - Default provider definitions

### Configuration Validation

Comprehensive validation for all configuration types:

- Environment variable validation
- Theme configuration validation
- Provider manifest validation
- Color scheme validation

### Error Handling

Centralized error handling with categorized errors:

- `AppError` class with error categories
- `ErrorBoundary` component for graceful degradation
- User-friendly error messages

### Runtime Directory Management

Project-scoped runtime directories:

- Per-project isolation using SHA256 hash
- Support for custom runtime directories via `MYLA_RUNTIME_DIR`
- Automatic directory creation
- Cleanup utilities for old directories

## Development

```bash
# Run in development mode
npm run dev

# Run tests
npm test

# Build
npm run build

# Lint
npm run lint

# Format
npm run format
```

## License

MIT
