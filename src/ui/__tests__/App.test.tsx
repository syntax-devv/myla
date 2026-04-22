import { render } from 'ink-testing-library';
import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import React from 'react';
import { StatusBar } from '../components/StatusBar';
import { CrashModal } from '../components/CrashModal';
import { ApprovalModal } from '../components/ApprovalModal';
import { OnboardingScreen } from '../components/OnboardingScreen';

describe('UI Component Regression Tests', () => {
  test('StatusBar renders engine name and state', () => {
    const { lastFrame } = render(<StatusBar engineName="Claude" state="running" />);
    const frame = lastFrame();
    assert.ok(frame);
    assert.ok(frame.includes('Claude'));
    assert.ok(frame.includes('running'));
  });

  test('StatusBar shows crash badge when crashed', () => {
    const { lastFrame } = render(<StatusBar engineName="Codex" state="crashed" />);
    const frame = lastFrame();
    assert.ok(frame);
    assert.ok(frame.includes('⚠'));
    assert.ok(frame.includes('crashed'));
  });

  test('CrashModal renders with engine name', () => {
    const { lastFrame } = render(
      <CrashModal
        visible={true}
        engineName="Claude"
        onRestart={() => {}}
        onDismiss={() => {}}
      />
    );
    const frame = lastFrame();
    assert.ok(frame);
    assert.ok(frame.includes('Claude'));
    assert.ok(frame.includes('crashed'));
  });

  test('ApprovalModal renders', () => {
    const { lastFrame } = render(
      <ApprovalModal
        visible={true}
        onApprove={() => {}}
        onDeny={() => {}}
      />
    );
    const frame = lastFrame();
    assert.ok(frame);
    assert.ok(frame.includes('Approval'));
  });

  test('OnboardingScreen renders with engine count', () => {
    const { lastFrame } = render(
      <OnboardingScreen
        engineCount={2}
        onDismiss={() => {}}
      />
    );
    const frame = lastFrame();
    assert.ok(frame);
    assert.ok(frame.includes('Welcome'));
    assert.ok(frame.includes('Key Commands'));
  });

  test('OnboardingScreen shows config guide when no engines', () => {
    const { lastFrame } = render(
      <OnboardingScreen
        engineCount={0}
        onDismiss={() => {}}
      />
    );
    const frame = lastFrame();
    assert.ok(frame);
    assert.ok(frame.includes('No engines detected'));
    assert.ok(frame.includes('config.toml'));
  });
});
