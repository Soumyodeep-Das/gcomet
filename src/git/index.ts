// src/git/index.ts
import simpleGit, { SimpleGit } from 'simple-git';
import { execSync } from 'child_process';

export class GitManager {
  private git: SimpleGit;

  constructor() {
    this.git = simpleGit();
  }

  async isGitRepository(): Promise<boolean> {
    try {
      await this.git.raw(['rev-parse', '--git-dir']);
      return true;
    } catch {
      return false;
    }
  }

  async getStagedDiff(): Promise<string> {
    try {
      const diff = await this.git.diff(['--cached', '--compact-summary']);
      return diff;
    } catch (error) {
      throw new Error(`Failed to get staged diff: ${error}`);
    }
  }

  async getLastCommitMessage(): Promise<string | null> {
    try {
      const log = await this.git.log({ maxCount: 1 });
      return log.latest?.message || null;
    } catch {
      return null;
    }
  }

  async getCurrentBranch(): Promise<string> {
    try {
      const branch = await this.git.revparse(['--abbrev-ref', 'HEAD']);
      return branch.trim();
    } catch {
      return 'main';
    }
  }

  async hasStagedChanges(): Promise<boolean> {
    try {
      const status = await this.git.status();
      return status.staged.length > 0;
    } catch {
      return false;
    }
  }

  async commit(message: string): Promise<void> {
    try {
      await this.git.commit(message);
    } catch (error) {
      throw new Error(`Failed to commit: ${error}`);
    }
  }

  async installHook(): Promise<void> {
    try {
      const hookPath = await this.git.raw(['rev-parse', '--git-dir']);
      const prepareCommitMsgPath = `${hookPath.trim()}/hooks/prepare-commit-msg`;
      
      const hookContent = `#!/bin/sh
# gcomet prepare-commit-msg hook
if [ -z "$2" ] || [ "$2" = "template" ]; then
  gcomet generate --force > "$1"
fi
`;

      require('fs').writeFileSync(prepareCommitMsgPath, hookContent, { mode: 0o755 });
    } catch (error) {
      throw new Error(`Failed to install hook: ${error}`);
    }
  }

  async uninstallHook(): Promise<void> {
    try {
      const hookPath = await this.git.raw(['rev-parse', '--git-dir']);
      const prepareCommitMsgPath = `${hookPath.trim()}/hooks/prepare-commit-msg`;
      
      require('fs').unlinkSync(prepareCommitMsgPath);
    } catch (error) {
      throw new Error(`Failed to uninstall hook: ${error}`);
    }
  }
}

export const gitManager = new GitManager();
