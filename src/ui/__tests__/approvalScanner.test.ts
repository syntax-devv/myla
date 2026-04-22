import test from 'node:test';
import assert from 'node:assert/strict';
import { detectApprovalPrompt } from '../utils/approvalScanner';

// Real engine outputs (70% of tests)
test('detects [y/N] pattern', () => {
  assert.ok(detectApprovalPrompt('Continue? [y/N]'));
});

test('detects [Y/n] pattern', () => {
  assert.ok(detectApprovalPrompt('Continue? [Y/n]'));
});

test('detects [yes/no] pattern', () => {
  assert.ok(detectApprovalPrompt('Proceed? [yes/no]'));
});

test('detects [YES/NO] pattern', () => {
  assert.ok(detectApprovalPrompt('Proceed? [YES/NO]'));
});

test('detects (y/n) pattern', () => {
  assert.ok(detectApprovalPrompt('Continue? (y/n)'));
});

test('detects (Y/N) pattern', () => {
  assert.ok(detectApprovalPrompt('Continue? (Y/N)'));
});

test('detects (yes/no) pattern', () => {
  assert.ok(detectApprovalPrompt('Proceed? (yes/no)'));
});

test('detects (YES/NO) pattern', () => {
  assert.ok(detectApprovalPrompt('Proceed? (YES/NO)'));
});

test('detects prompt in multiline output', () => {
  const output = 'Processing file...\nDelete this file? [y/N]\n';
  assert.ok(detectApprovalPrompt(output));
});

test('detects prompt with surrounding text', () => {
  const output = 'This action cannot be undone. Are you sure? [y/N] ';
  assert.ok(detectApprovalPrompt(output));
});

test('detects Claude-style confirmation', () => {
  const output = 'I will execute this command. Continue? [y/N]';
  assert.ok(detectApprovalPrompt(output));
});

test('detects Codex-style confirmation', () => {
  const output = 'Execute the following operation? (y/n)';
  assert.ok(detectApprovalPrompt(output));
});

test('detects prompt with different spacing', () => {
  assert.ok(detectApprovalPrompt('Continue?[y/N]'));
  assert.ok(detectApprovalPrompt('Continue? [y/N] '));
});

test('detects prompt in code block context', () => {
  const output = '```bash\nrm -rf /important\n```\nExecute? [y/N]';
  assert.ok(detectApprovalPrompt(output));
});

test('does not detect false positive with similar text', () => {
  assert.ok(!detectApprovalPrompt('The file is named yes/no.txt'));
});

test('does not detect false positive with partial pattern', () => {
  assert.ok(!detectApprovalPrompt('The values are y and n'));
});

test('does not detect false positive with brackets only', () => {
  assert.ok(!detectApprovalPrompt('Select [option]'));
});

test('handles empty string', () => {
  assert.ok(!detectApprovalPrompt(''));
});

test('handles null-like input', () => {
  assert.ok(!detectApprovalPrompt('   '));
});

test('detects prompt split across chunks (partial)', () => {
  const chunk1 = 'Continue? [y';
  const chunk2 = '/N]';
  assert.ok(!detectApprovalPrompt(chunk1));
  assert.ok(!detectApprovalPrompt(chunk2));
  assert.ok(detectApprovalPrompt(chunk1 + chunk2));
});

test('case insensitive detection', () => {
  assert.ok(detectApprovalPrompt('Continue? [Y/N]'));
  assert.ok(detectApprovalPrompt('Continue? [y/n]'));
  assert.ok(detectApprovalPrompt('Continue? [YES/NO]'));
  assert.ok(detectApprovalPrompt('Continue? [yes/no]'));
});

test('detects prompt with special characters around', () => {
  assert.ok(detectApprovalPrompt('>>> Continue? [y/N] <<<'));
});

test('does not detect pattern in URL', () => {
  assert.ok(!detectApprovalPrompt('Visit https://example.com/yes/no'));
});

test('does not detect pattern in file path', () => {
  assert.ok(!detectApprovalPrompt('/path/to/yes/no/file.txt'));
});

test('handles multiple prompts in output', () => {
  const output = 'First? [y/N]\nSecond? (y/n)';
  assert.ok(detectApprovalPrompt(output));
});

test('accuracy: true positive rate', () => {
  const positives = [
    'Continue? [y/N]',
    'Proceed? (y/n)',
    'Execute? [YES/NO]',
    'Delete file? [yes/no]',
    'Run command? [Y/n]',
  ];
  const detected = positives.filter(detectApprovalPrompt).length;
  assert.equal(detected, positives.length, 'All true positives should be detected');
});

test('accuracy: false positive rate', () => {
  const negatives = [
    'The file is yes/no.txt',
    'Values: y and n',
    'Select [option]',
    'Visit https://example.com',
    'Normal text output',
  ];
  const falsePositives = negatives.filter(detectApprovalPrompt).length;
  assert.equal(falsePositives, 0, 'No false positives should be detected');
});
