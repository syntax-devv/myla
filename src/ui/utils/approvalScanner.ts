const APPROVAL_PATTERNS = [
  /\[y\/N\]/i,
  /\[Y\/n\]/i,
  /\[yes\/no\]/i,
  /\[YES\/NO\]/i,
  /\(y\/n\)/i,
  /\(Y\/N\)/i,
  /\(yes\/no\)/i,
  /\(YES\/NO\)/i,
];

export function detectApprovalPrompt(text: string): boolean {
  return APPROVAL_PATTERNS.some(pattern => pattern.test(text));
}
