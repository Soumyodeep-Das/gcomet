// src/ai/index.ts - Corrected implementation using official GitHub Models API
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import type { CommitMessage } from '../types';

// Correct GitHub Models endpoint from official documentation
const GITHUB_MODELS_ENDPOINT = "https://models.github.ai/inference";

export class AIService {
  private readonly systemPrompt = `You are an expert Git commit message generator. Follow these rules strictly:

1. ALWAYS use Conventional Commits format: type(scope): description
2. Available types: feat, fix, docs, style, refactor, perf, test, build, ci, chore
3. Use imperative mood (Add, Fix, Update, not Added, Fixed, Updated)
4. Keep subject line ≤50 characters, no trailing period
5. Generate exactly ONE commit message
6. Write in English only
7. Be concise and professional
8. If you detect sensitive information (keys, passwords, tokens), start your response with "⚠️ SENSITIVE DATA DETECTED"

Examples:
- feat(auth): add password validation
- fix(api): handle null response error
- docs: update installation guide
- refactor(utils): extract helper functions`;

  async generateCommitMessage(
    diff: string,
    lastCommit: string | null,
    branch: string,
    model: string,
    token: string
  ): Promise<CommitMessage> {
    const userPrompt = this.buildPrompt(diff, lastCommit, branch);

    try {
      // Create client using official GitHub Models API
      const client = ModelClient(
        GITHUB_MODELS_ENDPOINT,
        new AzureKeyCredential(token)
      );

      // Map our model names to GitHub Models format
      const githubModel = this.mapModelName(model);

      const response = await client.path("/chat/completions").post({
        body: {
          messages: [
            { role: "system", content: this.systemPrompt },
            { role: "user", content: userPrompt }
          ],
          model: githubModel,
          max_tokens: 200,
          temperature: 0.3,
        }
      });

      if (isUnexpected(response)) {
        // Handle specific error cases based on GitHub Models documentation
        if (response.status === '401') {
          throw new Error('Invalid GitHub token. Please run "gcomet setup" to reconfigure.');
        }
        if (response.status === '403') {
          throw new Error('GitHub token does not have required "models:read" permissions.');
        }
        if (response.status === '429') {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }
        
        throw new Error(`GitHub Models API error: ${response.body?.error?.message || 'Unknown error'}`);
      }

      const content = response.body.choices?.[0]?.message?.content?.trim();
      if (!content) {
        throw new Error('No response from AI model');
      }

      // Check for sensitive data warning
      if (content.startsWith('⚠️ SENSITIVE DATA DETECTED')) {
        throw new Error('Sensitive data detected in diff. Please review your staged changes.');
      }

      return this.parseCommitMessage(content);
    } catch (error: any) {
      // Enhanced error handling for GitHub Models specific issues
      if (error.message?.includes('SENSITIVE DATA')) {
        throw error;
      }
      
      if (error.message?.includes('Invalid GitHub token')) {
        throw error;
      }
      
      if (error.message?.includes('models:read')) {
        throw error;
      }
      
      if (error.message?.includes('Rate limit')) {
        throw error;
      }
      
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNRESET') {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      throw new Error(`AI service error: ${error.message || 'Unknown error occurred'}`);
    }
  }

  private mapModelName(model: string): string {
    // Map our simplified model names to GitHub Models format
    const modelMap: Record<string, string> = {
      'gpt-4o-mini': 'openai/gpt-4o-mini',
      'gpt-4o': 'openai/gpt-4o', 
      'gpt-3.5-turbo': 'openai/gpt-3.5-turbo',
      // Add more model mappings as GitHub adds them
    };
    
    return modelMap[model] || 'openai/gpt-4o-mini'; // Default fallback
  }

  private buildPrompt(diff: string, lastCommit: string | null, branch: string): string {
    let prompt = `Generate a commit message for these staged changes:\n\n`;
    
    // Limit diff size to avoid token limits
    if (diff.length > 5000) {
      diff = diff.substring(0, 5000) + '\n... (truncated)';
    }
    
    prompt += `DIFF:\n${diff}\n\n`;
    
    if (lastCommit) {
      prompt += `LAST COMMIT: ${lastCommit}\n`;
    }
    
    if (branch && branch !== 'main' && branch !== 'master') {
      prompt += `BRANCH: ${branch}\n`;
    }
    
    prompt += `\nGenerate ONE commit message following Conventional Commits format.`;
    
    return prompt;
  }

  private parseCommitMessage(content: string): CommitMessage {
    const lines = content.split('\n').filter(line => line.trim());
    const subject = lines[0];
    const body = lines.length > 1 ? lines.slice(1).join('\n') : undefined;

    return { subject, body };
  }
}

export const aiService = new AIService();
