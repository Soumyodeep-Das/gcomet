// src/types.ts
export interface Config {
  githubToken?: string;
  model: string;
  alwaysAskBeforeCommit: boolean;
  maxDiffSize: number;
  remoteConfigUrl?: string;
  lastRemoteConfigFetch?: number;
}

export interface RemoteConfig {
  defaultModel: string;
  minVersion: string;
  messages?: {
    warning?: string;
    info?: string;
  };
}

export interface CommitMessage {
  subject: string;
  body?: string;
}

export interface GenerateOptions {
  force?: boolean;
  model?: string;
}