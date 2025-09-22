// src/commands/hook.ts
import chalk from 'chalk';
import { gitManager } from '../git';

export async function installHook(): Promise<void> {
  try {
    if (!(await gitManager.isGitRepository())) {
      console.error(chalk.red('Error: Not in a Git repository'));
      process.exit(1);
    }

    await gitManager.installHook();
    console.log(chalk.green('✓ prepare-commit-msg hook installed successfully!'));
    console.log(chalk.gray('Now "git commit" will automatically generate commit messages.'));
  } catch (error) {
    console.error(chalk.red(`Error installing hook: ${error}`));
    process.exit(1);
  }
}

export async function uninstallHook(): Promise<void> {
  try {
    if (!(await gitManager.isGitRepository())) {
      console.error(chalk.red('Error: Not in a Git repository'));
      process.exit(1);
    }

    await gitManager.uninstallHook();
    console.log(chalk.green('✓ prepare-commit-msg hook uninstalled successfully!'));
  } catch (error) {
    console.error(chalk.red(`Error uninstalling hook: ${error}`));
    process.exit(1);
  }
}
