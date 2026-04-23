import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  staged: number;
  unstaged: number;
  untracked: number;
  hasChanges: boolean;
}

export async function getGitStatus(cwd: string): Promise<GitStatus | null> {
  try {
    const { stdout } = await execAsync('git status --porcelain --branch', { cwd });
    const lines = stdout.trim().split('\n');

    const status: GitStatus = {
      branch: 'main',
      ahead: 0,
      behind: 0,
      staged: 0,
      unstaged: 0,
      untracked: 0,
      hasChanges: false,
    };

    for (const line of lines) {
      if (line.startsWith('##')) {
        const branchInfo = line.substring(2);
        const branchMatch = branchInfo.match(/^([^\s.]+)(?:\.\.\.([^\s]+))?(?: \[(ahead (\d+))?(?:, )?(behind (\d+))?\])?/);
        if (branchMatch) {
          status.branch = branchMatch[1];
          status.ahead = branchMatch[3] ? parseInt(branchMatch[3], 10) : 0;
          status.behind = branchMatch[5] ? parseInt(branchMatch[5], 10) : 0;
        }
      } else if (line.length > 0) {
        status.hasChanges = true;
        const firstChar = line[0];
        const secondChar = line[1];

        if (firstChar === '?' || secondChar === '?') {
          status.untracked++;
        } else if (firstChar !== ' ' && firstChar !== '?') {
          status.staged++;
        } else if (secondChar !== ' ' && secondChar !== '?') {
          status.unstaged++;
        }
      }
    }

    return status;
  } catch (err) {
    return null;
  }
}

export function formatGitStatus(status: GitStatus): string {
  const parts: string[] = [];

  parts.push(status.branch);

  if (status.ahead > 0) parts.push(`↑${status.ahead}`);
  if (status.behind > 0) parts.push(`↓${status.behind}`);
  if (status.staged > 0) parts.push(`+${status.staged}`);
  if (status.unstaged > 0) parts.push(`~${status.unstaged}`);
  if (status.untracked > 0) parts.push(`?${status.untracked}`);

  return parts.join(' ');
}
