import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ONBOARDING_FLAG = path.join(os.homedir(), '.myla', '.onboarding-complete');

export function hasCompletedOnboarding(): boolean {
  return fs.existsSync(ONBOARDING_FLAG);
}

export function markOnboardingComplete(): void {
  fs.writeFileSync(ONBOARDING_FLAG, '');
}
