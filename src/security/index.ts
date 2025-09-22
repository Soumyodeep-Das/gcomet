// src/security/index.ts
export class SecurityScanner {
  private readonly sensitivePatterns = [
    /api[_-]?key[_-]?=?["\s]*([a-zA-Z0-9_-]{20,})/gi,
    /secret[_-]?key[_-]?=?["\s]*([a-zA-Z0-9_-]{20,})/gi,
    /password[_-]?=?["\s]*([^\s"']{8,})/gi,
    /token[_-]?=?["\s]*([a-zA-Z0-9_-]{20,})/gi,
    /private[_-]?key/gi,
    /-----BEGIN[\s\S]*PRIVATE KEY[\s\S]*-----/gi,
    /github_pat_[a-zA-Z0-9_]{82}/gi,
    /ghp_[a-zA-Z0-9]{36}/gi,
    /aws_access_key_id/gi,
    /aws_secret_access_key/gi,
  ];

  scanForSensitiveData(diff: string): string[] {
    const findings: string[] = [];
    
    for (const pattern of this.sensitivePatterns) {
      const matches = diff.match(pattern);
      if (matches) {
        findings.push(...matches.map(match => match.substring(0, 50) + '...'));
      }
    }
    
    return findings;
  }

  hasSensitiveData(diff: string): boolean {
    return this.scanForSensitiveData(diff).length > 0;
  }
}

export const securityScanner = new SecurityScanner();
