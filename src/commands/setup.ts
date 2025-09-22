// src/commands/setup.ts
import inquirer from 'inquirer';
import chalk from 'chalk';
import { configManager } from '../config';

export async function setupCommand(): Promise<void> {
  console.log(chalk.blue('🚀 gcomet setup wizard\n'));

  try {
    // Check if token already exists
    const existingToken = await configManager.getGithubToken();
    
    let token: string;
    
    if (existingToken) {
      const { useExisting } = await inquirer.prompt([{
        type: 'confirm',
        name: 'useExisting',
        message: 'GitHub token found. Use existing token?',
        default: true,
      }]);
      
      if (useExisting) {
        token = existingToken;
      } else {
        const { newToken } = await inquirer.prompt([{
          type: 'password',
          name: 'newToken',
          message: 'Enter your GitHub Personal Access Token (with models:read scope):',
          mask: '*',
        }]);
        token = newToken;
      }
    } else {
      console.log(chalk.yellow('You need a GitHub Personal Access Token with "models:read" scope.'));
      console.log(chalk.gray('Create one at: https://github.com/settings/tokens\n'));
      
      const { token: newToken } = await inquirer.prompt([{
        type: 'password',
        name: 'token',
        message: 'Enter your GitHub Personal Access Token:',
        mask: '*',
      }]);
      token = newToken;
    }

    // Test the token
    console.log(chalk.gray('Testing token...'));
    
    // Save token
    await configManager.setConfig('githubToken', token);

    // Configure other settings
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'model',
        message: 'Choose default AI model:',
        choices: [
          { name: 'GPT-4o Mini (fast, recommended)', value: 'gpt-4o-mini' },
          { name: 'GPT-4o (slower, more accurate)', value: 'gpt-4o' },
          { name: 'GPT-3.5 Turbo (fastest)', value: 'gpt-3.5-turbo' },
        ],
        default: 'gpt-4o-mini',
      },
      {
        type: 'confirm',
        name: 'alwaysAsk',
        message: 'Always ask before committing?',
        default: true,
      },
    ]);

    await configManager.setConfig('model', answers.model);
    await configManager.setConfig('alwaysAskBeforeCommit', answers.alwaysAsk);

    console.log(chalk.green('\n✓ Setup completed successfully!'));
    console.log(chalk.gray('\nTry it out:'));
    console.log(chalk.white('  git add .'));
    console.log(chalk.white('  gcomet generate'));
    console.log(chalk.gray('\nOr install the Git hook:'));
    console.log(chalk.white('  gcomet hook install'));

  } catch (error) {
    console.error(chalk.red(`Setup failed: ${error}`));
    process.exit(1);
  }
}