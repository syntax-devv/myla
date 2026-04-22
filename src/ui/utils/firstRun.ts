import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ONBOARDING_FLAG = path.join(os.homedir(), '.myla', '.onboarding-complete');
const MYLA_DIR = path.join(os.homedir(), '.myla');

export function hasCompletedOnboarding(): boolean {
  return fs.existsSync(ONBOARDING_FLAG);
}

export function markOnboardingComplete(): void {
  if (!fs.existsSync(MYLA_DIR)) {
    fs.mkdirSync(MYLA_DIR, { recursive: true });
  }
  fs.writeFileSync(ONBOARDING_FLAG, '');
}
