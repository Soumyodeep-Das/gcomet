# gcomet

[![npm version](https://badge.fury.io/js/gcomet.svg)](https://badge.fury.io/js/gcomet)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Coverage Status](https://coveralls.io/repos/github/Soumyodeep-Das/gcomet/badge.svg?branch=main)](https://coveralls.io/github/Soumyodeep-Das/gcomet?branch=main)

**AI-powered Git commit message generator that creates professional, conventional commit messages in seconds.**

gcomet analyzes your staged changes and generates clear, descriptive commit messages following industry best practices. Built with TypeScript and powered by GitHub's AI models.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [Configuration](#configuration)
- [Git Integration](#git-integration)
- [Security](#security)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Lightning Fast** - Generates commit messages in under 5 seconds
- **Conventional Commits** - Follows industry-standard format automatically
- **AI-Powered** - Uses GitHub's hosted AI models (GPT-4o, GPT-3.5-turbo)
- **Security First** - Detects and warns about sensitive data in diffs
- **Git Native** - Seamless integration with existing Git workflows
- **Cross Platform** - Works on Windows, macOS, and Linux
- **Zero Config** - Works out of the box with sensible defaults
- **Interactive** - Smart prompts and confirmations
- **Extensible** - Configuration options for team preferences

## Installation

### npm (Recommended)

```bash
npm install -g gcomet
```

### Yarn

```bash
yarn global add gcomet
```

### pnpm

```bash
pnpm add -g gcomet
```

### Verify Installation

```bash
gcomet --version
```

## Quick Start

### 1. Initial Setup

Run the setup wizard to configure your GitHub token:

```bash
gcomet setup
```

You'll need a GitHub Personal Access Token with `models:read` scope. Create one at [github.com/settings/tokens](https://github.com/settings/tokens).

### 2. Generate Your First Commit

```bash
# Stage your changes
git add .

# Generate and commit
gcomet generate
```

That's it! gcomet will analyze your changes and create a professional commit message.

### 3. Automate with Git Hooks (Optional)

```bash
# Install Git hook for automatic generation
gcomet hook install

# Now every git commit will auto-generate messages
git add .
git commit
```

## Usage

### Commands

#### `gcomet generate`

Generates a commit message for staged changes.

```bash
gcomet generate                    # Interactive mode with confirmation
gcomet generate --force           # Auto-commit without asking
gcomet generate --model gpt-4o    # Use specific AI model
gcomet gen                         # Short alias
```

**Options:**
- `-f, --force` - Skip confirmation prompt and commit immediately
- `-m, --model <model>` - Override default AI model for this commit

#### `gcomet setup`

Interactive setup wizard for initial configuration.

```bash
gcomet setup
```

Guides you through:
- GitHub token configuration
- Default model selection
- Commit behavior preferences

#### `gcomet hook install|uninstall`

Manage Git hooks for automatic commit message generation.

```bash
gcomet hook install    # Install prepare-commit-msg hook
gcomet hook uninstall  # Remove the hook
```

#### `gcomet config`

Manage configuration settings.

```bash
gcomet config set <key> <value>    # Set configuration
gcomet config get <key>            # Get configuration value
gcomet config list                 # List all settings
```

**Available Settings:**
- `model` - AI model to use (gpt-4o-mini, gpt-4o, gpt-3.5-turbo)
- `alwaysAskBeforeCommit` - Whether to ask for confirmation (true/false)
- `maxDiffSize` - Maximum diff size to process (number)

## Configuration

### Configuration File

Settings are stored in `~/.gcomet/config.json`:

```json
{
  "model": "gpt-4o-mini",
  "alwaysAskBeforeCommit": true,
  "maxDiffSize": 10000,
  "githubToken": "ghp_xxxxxxxxxxxx"
}
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GITHUB_TOKEN` | GitHub Personal Access Token | `ghp_xxxxxxxxxxxx` |

### Available Models

| Model | Speed | Quality | Cost | Recommended For |
|-------|-------|---------|------|-----------------|
| `gpt-4o-mini` | Fast | High | Low | **Default choice** |
| `gpt-4o` | Slow | Highest | High | Complex changes |
| `gpt-3.5-turbo` | Fastest | Good | Lowest | Quick commits |

## Git Integration

### Method 1: Git Hook (Recommended)

Install the prepare-commit-msg hook to automatically generate messages:

```bash
gcomet hook install
```

Now every `git commit` will generate a message automatically:

```bash
git add src/auth.js
git commit
# Opens editor with: feat(auth): add password validation middleware
```

### Method 2: Git Alias

Create a custom Git command:

```bash
git config --global alias.smart-commit '!gcomet generate'
```

Usage:
```bash
git add .
git smart-commit
```

### Method 3: Manual Usage

Generate messages on-demand:

```bash
git add .
gcomet generate
```

## Security

gcomet includes built-in security features to protect sensitive information:

### Sensitive Data Detection

Automatically scans for and warns about:
- API keys and tokens
- Passwords and secrets
- Private keys and certificates
- Database connection strings

```bash
$ git add config.js  # Contains API_KEY="secret123"
$ gcomet generate

⚠️  Warning: Potential sensitive data detected:
  API_KEY="secret123"...

? Continue anyway? (y/N) 
```

### Security Best Practices

- Tokens are never logged or transmitted except to GitHub's API
- Configuration files use appropriate permissions
- Respects `.gitignore` patterns
- Provides clear warnings for sensitive content

## Examples

### Basic Workflow

```bash
# Make some changes
echo "export const API_URL = 'https://api.example.com';" > src/config.js

# Stage changes
git add src/config.js

# Generate commit message
gcomet generate
```

**Output:**
```
✓ Commit message generated!

Generated commit message:
feat(config): add API URL configuration

? What would you like to do?
❯ Commit with this message
  Edit the message  
  Cancel
```

### Different Types of Changes

#### Feature Addition
```bash
# Added new login functionality
git add src/auth/login.js

gcomet generate
# Output: feat(auth): add user login functionality
```

#### Bug Fix
```bash
# Fixed validation issue
git add src/validation.js

gcomet generate  
# Output: fix(validation): handle empty email input
```

#### Documentation
```bash
# Updated README
git add README.md

gcomet generate
# Output: docs: update installation instructions
```

#### Refactoring
```bash
# Extracted helper functions
git add src/utils/helpers.js

gcomet generate
# Output: refactor(utils): extract database helper functions
```

### Batch Operations

```bash
# Multiple related changes
git add src/auth/ tests/auth/ docs/auth.md

gcomet generate
# Output: feat(auth): implement user authentication system
```

### Force Mode for CI/CD

```bash
# Automated environments
gcomet generate --force
# Commits immediately without confirmation
```

### Model Selection

```bash
# Use more sophisticated model for complex changes
gcomet generate --model gpt-4o

# Use faster model for simple updates
gcomet generate --model gpt-3.5-turbo
```

## Troubleshooting

### Common Issues

#### "GitHub token not found"

**Cause:** No valid GitHub token configured.

**Solution:**
```bash
gcomet setup  # Run setup wizard
# OR
export GITHUB_TOKEN=your_token_here
```

#### "Not in a Git repository"

**Cause:** Command run outside a Git repository.

**Solution:**
```bash
cd your-project-directory
git init  # If needed
```

#### "No staged changes found"

**Cause:** No files staged for commit.

**Solution:**
```bash
git add .              # Stage all changes
git add specific-file  # Stage specific file
```

#### Network/API Errors

**Cause:** Internet connectivity or GitHub API issues.

**Solutions:**
1. Check internet connection
2. Verify token has `models:read` scope
3. Try different model: `gcomet generate --model gpt-3.5-turbo`
4. Use fallback option when prompted

#### Hook Installation Failed

**Cause:** Insufficient permissions or existing hook conflicts.

**Solution:**
```bash
# Check Git repository status
git status

# Manual hook installation
chmod +x .git/hooks/prepare-commit-msg
```

### Debug Mode

Enable detailed logging:

```bash
DEBUG=gcomet* gcomet generate
```

### Getting Help

1. **Check documentation:** Review this README and examples
2. **Verify setup:** Run `gcomet config list` to check configuration
3. **Test token:** Run `gcomet setup` to verify GitHub token
4. **Report issues:** Open an issue on GitHub with debug output

## Best Practices

### Team Usage

1. **Standardize model:** Set team-wide model preference
   ```bash
   gcomet config set model gpt-4o-mini
   ```

2. **Use Git hooks:** Install hooks in shared repositories
   ```bash
   gcomet hook install
   git add .gcomet/
   git commit -m "chore: add gcomet configuration"
   ```

3. **Document conventions:** Add to your contributing guidelines
   ```markdown
   ## Commit Messages
   This project uses [gcomet](https://github.com/Soumyodeep-Das/gcomet) 
   for automated commit message generation following Conventional Commits.
   ```

### Performance Tips

1. **Limit diff size:** Large diffs may be slow
   ```bash
   gcomet config set maxDiffSize 5000
   ```

2. **Use faster model:** For frequent commits
   ```bash
   gcomet config set model gpt-3.5-turbo
   ```

3. **Enable force mode:** Skip confirmations
   ```bash
   gcomet config set alwaysAskBeforeCommit false
   ```

## API Reference

### Command Options

| Command | Options | Description |
|---------|---------|-------------|
| `generate` | `-f, --force` | Skip confirmation prompt |
| `generate` | `-m, --model <model>` | Use specific AI model |
| `config set` | `<key> <value>` | Set configuration value |
| `config get` | `<key>` | Get configuration value |
| `hook install` | - | Install prepare-commit-msg hook |

### Configuration Schema

```typescript
interface Config {
  githubToken?: string;           // GitHub PAT with models:read
  model: string;                  // AI model identifier  
  alwaysAskBeforeCommit: boolean; // Confirmation prompt
  maxDiffSize: number;            // Maximum diff size to process
  remoteConfigUrl?: string;       // Remote config endpoint
}
```

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Configuration error |
| 3 | Git repository error |
| 4 | Network/API error |

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Start for Contributors

```bash
git clone https://github.com/Soumyodeep-Das/gcomet.git
cd gcomet
npm install
npm run dev
```

### Development Scripts

```bash
npm run build      # Build TypeScript
npm run test       # Run tests
npm run test:watch # Watch mode
npm run lint       # ESLint
npm run format     # Prettier
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Commander.js](https://github.com/tj/commander.js) for CLI framework
- Uses [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) for interactive prompts
- Powered by [GitHub Models](https://github.com/marketplace/models) for AI generation
- Follows [Conventional Commits](https://conventionalcommits.org/) specification

---

**Made for developers who care about clean commit history.**

[Report Bug](https://github.com/Soumyodeep-Das/gcomet/issues) · [Request Feature](https://github.com/Soumyodeep-Das/gcomet/issues) · [Documentation](https://github.com/Soumyodeep-Das/gcomet/wiki)