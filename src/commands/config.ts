// src/commands/config.ts
import chalk from 'chalk';
import { configManager } from '../config';
import type { Config } from '../types';

// Define valid configuration keys for type safety
const VALID_CONFIG_KEYS: (keyof Config)[] = [
  'model',
  'alwaysAskBeforeCommit',
  'maxDiffSize',
  'githubToken',
  'remoteConfigUrl'
];

// Define which keys are sensitive and should be hidden
const SENSITIVE_KEYS = ['githubToken'];

// Helper function to validate configuration keys
function isValidConfigKey(key: string): key is keyof Config {
  return VALID_CONFIG_KEYS.includes(key as keyof Config);
}

// Helper function to parse and validate configuration values
function parseConfigValue(key: keyof Config, value: string): any {
  switch (key) {
    case 'alwaysAskBeforeCommit':
      return value.toLowerCase() === 'true';
    
    case 'maxDiffSize':
      const numValue = parseInt(value, 10);
      if (isNaN(numValue) || numValue < 0) {
        throw new Error('maxDiffSize must be a positive number');
      }
      return numValue;
    
    case 'model':
      const validModels = ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'];
      if (!validModels.includes(value)) {
        throw new Error(`model must be one of: ${validModels.join(', ')}`);
      }
      return value;
    
    case 'githubToken':
    case 'remoteConfigUrl':
      return value;
    
    default:
      return value;
  }
}


export const configCommand = {
  async set(key: string, value: string): Promise<void> {
    try {
      if (!isValidConfigKey(key)) {
        console.error(chalk.red(`Error: Invalid configuration key "${key}"`));
        console.error(chalk.gray(`Valid keys: ${VALID_CONFIG_KEYS.join(', ')}`));
        return;
      }

      // Parse and validate the value
      const parsedValue = parseConfigValue(key, value);

      await configManager.setConfig(key, parsedValue);
      
      // Hide sensitive values in output
      const displayValue = SENSITIVE_KEYS.includes(key) ? '***hidden***' : parsedValue;
      console.log(chalk.green(`✓ Set ${key} = ${displayValue}`));
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`Error setting config: ${errorMessage}`));
    }
  },

  async get(key: string): Promise<void> {
    try {
      if (!isValidConfigKey(key)) {
        console.error(chalk.red(`Error: Invalid configuration key "${key}"`));
        console.error(chalk.gray(`Valid keys: ${VALID_CONFIG_KEYS.join(', ')}`));
        return;
      }

      const value = await configManager.getConfig(key);
      
      // Hide sensitive values in output
      const displayValue = SENSITIVE_KEYS.includes(key) && value 
        ? '***hidden***' 
        : (value ?? 'not set');
      
      console.log(`${key} = ${displayValue}`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`Error getting config: ${errorMessage}`));
    }
  },

  async list(): Promise<void> {
    try {
      const config = await configManager.loadConfig();
      console.log(chalk.blue('Current configuration:'));
      
      Object.entries(config).forEach(([key, value]) => {
        const displayValue = SENSITIVE_KEYS.includes(key) && value
          ? '***hidden***'
          : (value ?? 'not set');
        
        console.log(`  ${key} = ${displayValue}`);
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`Error listing config: ${errorMessage}`));
    }
  },

  async reset(key?: string): Promise<void> {
    try {
      if (key) {
        if (!isValidConfigKey(key)) {
          console.error(chalk.red(`Error: Invalid configuration key "${key}"`));
          console.error(chalk.gray(`Valid keys: ${VALID_CONFIG_KEYS.join(', ')}`));
          return;
        }

        const defaultConfig = {
          model: 'gpt-4o-mini',
          alwaysAskBeforeCommit: true,
          maxDiffSize: 10000,
          remoteConfigUrl: 'https://raw.githubusercontent.com/your-org/gcomet-config/main/config.json'
        } as Config;

        const defaultValue = defaultConfig[key];
        if (defaultValue !== undefined) {
          await configManager.setConfig(key, defaultValue);
          console.log(chalk.green(`✓ Reset ${key} to default value: ${defaultValue}`));
        } else {
          console.log(chalk.yellow(`Warning: No default value for ${key}`));
        }
      } else {
        // Reset all configuration
        await configManager.setConfig('model', 'gpt-4o-mini');
        await configManager.setConfig('alwaysAskBeforeCommit', true);
        await configManager.setConfig('maxDiffSize', 10000);
        console.log(chalk.green('✓ Reset all configuration to defaults'));
        console.log(chalk.yellow('Note: GitHub token was not reset. Run "gcomet setup" to reconfigure.'));
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`Error resetting config: ${errorMessage}`));
    }
  }
};

