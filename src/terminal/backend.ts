export interface TerminalBackend {
  sendText(paneId: string, text: string): void;
  isAlive(paneId: string): boolean;
  killPane(paneId: string, signal?: NodeJS.Signals): void;
  activate(paneId: string): void;
  createPane(config: PaneConfig): string;
}

export interface PaneConfig {
  command: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
  direction?: 'horizontal' | 'vertical';
  percent?: number;
  parentPaneId?: string;
}

export type BackendType = 'pty' | 'tmux' | 'wezterm';
