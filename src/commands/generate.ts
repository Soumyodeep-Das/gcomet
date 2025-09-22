// src/commands/generate.ts
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { configManager } from '../config';
import { gitManager } from '../git';
import { aiService } from '../ai';
import { securityScanner } from '../security';
import type { GenerateOptions } from '../types';

export async function generateCommitMessage(options: GenerateOptions = {}): Promise<void> {
  try {
    // Check if we're in a git repository
    if (!(await gitManager.isGitRepository())) {
      console.error(chalk.red('Error: Not in a Git repository'));
      process.exit(1);
    }

    // Check if there are staged changes
    if (!(await gitManager.hasStagedChanges())) {
      console.error(chalk.yellow('Warning: No staged changes found. Use "git add" first.'));
      process.exit(1);
    }

    // Get configuration
    const config = await configManager.loadConfig();
    const model = options.model || config.model;

    // Get GitHub token
    const token = await configManager.getGithubToken();
    if (!token) {
      console.error(chalk.red('Error: GitHub token not found. Run "gcomet setup" first.'));
      process.exit(1);
    }

    // Get git information
    const diff = await gitManager.getStagedDiff();
    const lastCommit = await gitManager.getLastCommitMessage();
    const branch = await gitManager.getCurrentBranch();

    // Security check
    if (securityScanner.hasSensitiveData(diff)) {
      const findings = securityScanner.scanForSensitiveData(diff);
      console.warn(chalk.yellow('⚠️  Warning: Potential sensitive data detected:'));
      findings.forEach(finding => console.warn(chalk.gray(`  ${finding}`)));
      
      if (!options.force) {
        const { proceed } = await inquirer.prompt([{
          type: 'confirm',
          name: 'proceed',
          message: 'Continue anyway?',
          default: false,
        }]);
        
        if (!proceed) {
          console.log(chalk.gray('Cancelled.'));
          return;
        }
      }
    }

    // Generate commit message
    const spinner = ora('Generating commit message...').start();
    
    try {
      const commitMessage = await aiService.generateCommitMessage(
        diff, 
        lastCommit, 
        branch, 
        model, 
        token
      );
      
      spinner.succeed('Commit message generated!');
      
      console.log('\n' + chalk.green('Generated commit message:'));
      console.log(chalk.white(`${commitMessage.subject}`));
      if (commitMessage.body) {
        console.log(chalk.gray(`\n${commitMessage.body}`));
      }

      // Ask for confirmation unless forced
      if (!options.force && config.alwaysAskBeforeCommit) {
        const { action } = await inquirer.prompt([{
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: 'Commit with this message', value: 'commit' },
            { name: 'Edit the message', value: 'edit' },
            { name: 'Cancel', value: 'cancel' },
          ],
        }]);

        switch (action) {
          case 'commit':
            await gitManager.commit(commitMessage.subject);
            console.log(chalk.green('✓ Committed successfully!'));
            break;
          case 'edit':
            const { editedMessage } = await inquirer.prompt([{
              type: 'input',
              name: 'editedMessage',
              message: 'Edit commit message:',
              default: commitMessage.subject,
            }]);
            await gitManager.commit(editedMessage);
            console.log(chalk.green('✓ Committed successfully!'));
            break;
          case 'cancel':
            console.log(chalk.gray('Cancelled.'));
            break;
        }
      } else {
        // Auto-commit when forced or configured to do so
        await gitManager.commit(commitMessage.subject);
        console.log(chalk.green('✓ Committed successfully!'));
      }

    } catch (error) {
      spinner.fail('Failed to generate commit message');
      
      if (error instanceof Error) {
        if (error.message.includes('SENSITIVE DATA')) {
          console.error(chalk.red(`Security Error: ${error.message}`));
        } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
          console.error(chalk.red('Error: Invalid GitHub token. Please run "gcomet setup" to reconfigure.'));
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          console.error(chalk.red('Error: Network error. Please check your internet connection.'));
          
          // Fallback option
          const { useFallback } = await inquirer.prompt([{
            type: 'confirm',
            name: 'useFallback',
            message: 'Generate a basic commit message instead?',
            default: true,
          }]);
          
          if (useFallback) {
            const fallbackMessage = `chore: update ${diff.split('\n').length} files`;
            console.log(chalk.yellow(`Fallback message: ${fallbackMessage}`));
            await gitManager.commit(fallbackMessage);
            console.log(chalk.green('✓ Committed with fallback message!'));
          }
        } else {
          console.error(chalk.red(`Error: ${error.message}`));
        }
      }
      
      process.exit(1);
    }

  } catch (error) {
    console.error(chalk.red(`Unexpected error: ${error}`));
    process.exit(1);
  }
}
