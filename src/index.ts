#!/usr/bin/env node

import { Command } from 'commander';
import { generateCommitMessage } from './commands/generate';
import { installHook, uninstallHook } from './commands/hook';
import { configCommand } from './commands/config';
import { setupCommand } from './commands/setup';
import chalk from 'chalk';

const program = new Command();

program
  .name('gcomet')
  .description('AI-powered Git commit message generator')
  .version('1.0.0');

program
  .command('generate')
  .alias('gen')
  .description('Generate a commit message for staged changes')
  .option('-f, --force', 'Skip confirmation prompt')
  .option('-m, --model <model>', 'Override default AI model')
  .action(generateCommitMessage);

program
  .command('hook')
  .description('Manage Git hooks')
  .addCommand(
    new Command('install')
      .description('Install prepare-commit-msg hook')
      .action(installHook)
  )
  .addCommand(
    new Command('uninstall')
      .description('Uninstall prepare-commit-msg hook')
      .action(uninstallHook)
  );

program
  .command('config')
  .description('Manage configuration')
  .addCommand(
    new Command('set')
      .description('Set configuration value')
      .argument('<key>', 'Configuration key')
      .argument('<value>', 'Configuration value')
      .action(configCommand.set)
  )
  .addCommand(
    new Command('get')
      .description('Get configuration value')
      .argument('<key>', 'Configuration key')
      .action(configCommand.get)
  )
  .addCommand(
    new Command('list')
      .description('List all configuration')
      .action(configCommand.list)
  );

program
  .command('setup')
  .description('Initial setup wizard')
  .action(setupCommand);

// Default action for git commit -M integration
if (process.argv.length === 2) {
  generateCommitMessage({ force: false });
} else {
  program.parse();
}
