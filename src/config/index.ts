// src/config/index.ts
import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { ofetch } from 'ofetch';
import type { Config, RemoteConfig } from '../types';

const CONFIG_DIR = join(homedir(), '.gcomet');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');
const REMOTE_CONFIG_CACHE = join(CONFIG_DIR, 'remote-config.json');

const DEFAULT_CONFIG: Config = {
  model: 'gpt-4o-mini',
  alwaysAskBeforeCommit: true,
  maxDiffSize: 10000,
  remoteConfigUrl: 'https://raw.githubusercontent.com/your-org/gcomet-config/main/config.json'
};

export class ConfigManager {
  private config: Config | null = null;

  async ensureConfigDir(): Promise<void> {
    try {
      await fs.access(CONFIG_DIR);
    } catch {
      await fs.mkdir(CONFIG_DIR, { recursive: true });
    }
  }

  async loadConfig(): Promise<Config> {
    if (this.config) {
      return this.config;
    }

    await this.ensureConfigDir();

    try {
      const data = await fs.readFile(CONFIG_FILE, 'utf-8');
      this.config = { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    } catch {
      this.config = { ...DEFAULT_CONFIG };
      await this.saveConfig();
    }

    // At this point, this.config is guaranteed to be non-null
    // because we just assigned it above
    const currentConfig = this.config!;

    // Merge with remote config if available
    try {
      const remoteConfig = await this.getRemoteConfig();
      if (remoteConfig) {
        currentConfig.model = remoteConfig.defaultModel || currentConfig.model;
        this.config = currentConfig;
      }
    } catch {
      // Remote config failed, continue with local config
    }

    return currentConfig;
  }

  async saveConfig(): Promise<void> {
    if (!this.config) return;
    
    await this.ensureConfigDir();
    await fs.writeFile(CONFIG_FILE, JSON.stringify(this.config, null, 2));
  }

  async setConfig(key: keyof Config, value: any): Promise<void> {
    const config = await this.loadConfig();
    (config as any)[key] = value;
    this.config = config; // Update the cached config
    await this.saveConfig();
  }

  async getConfig(key: keyof Config): Promise<any> {
    const config = await this.loadConfig();
    return config[key];
  }

  async getGithubToken(): Promise<string | null> {
    // 1. Check environment variable
    if (process.env.GITHUB_TOKEN) {
      return process.env.GITHUB_TOKEN;
    }

    // 2. Check config file
    const config = await this.loadConfig();
    if (config.githubToken) {
      return config.githubToken;
    }

    // 3. Try to get from gh CLI
    try {
      const { execSync } = require('child_process');
      const token = execSync('gh auth token', { encoding: 'utf-8', stdio: 'pipe' });
      return token.trim();
    } catch {
      // gh CLI not available or not authenticated
    }

    return null;
  }

  private async getRemoteConfig(): Promise<RemoteConfig | null> {
    // Don't call loadConfig() here to avoid circular dependency
    if (!this.config?.remoteConfigUrl) return null;

    const now = Date.now();
    const cacheMaxAge = 24 * 60 * 60 * 1000; // 24 hours

    // Check if we have a recent cache
    if (this.config.lastRemoteConfigFetch && (now - this.config.lastRemoteConfigFetch) < cacheMaxAge) {
      try {
        const cached = await fs.readFile(REMOTE_CONFIG_CACHE, 'utf-8');
        return JSON.parse(cached);
      } catch {
        // Cache read failed, fetch new
      }
    }

    try {
      const remoteConfig = await ofetch<RemoteConfig>(this.config.remoteConfigUrl, {
        timeout: 5000
      });

      // Cache the result
      await fs.writeFile(REMOTE_CONFIG_CACHE, JSON.stringify(remoteConfig));
      
      // Update the config with new fetch time
      this.config.lastRemoteConfigFetch = now;
      await this.saveConfig();

      return remoteConfig;
    } catch {
      // Remote config fetch failed, return null
      return null;
    }
  }
}

export const configManager = new ConfigManager();