import type { Theme } from './themeTypes.js';

export const BUILTIN_THEMES: Theme[] = [
  {
    id: 'default-dark',
    name: 'Default Dark',
    isDark: true,
    colors: {
      primary: '#61afef',
      secondary: '#c678dd',
      background: '#1e1e2e',
      text: '#cdd6f4',
      muted: '#6c7086',
      accent: '#89b4fa',
      error: '#f38ba8',
      success: '#a6e3a1',
      warning: '#f9e2af',
    },
  },
  {
    id: 'default-light',
    name: 'Default Light',
    isDark: false,
    colors: {
      primary: '#2196f3',
      secondary: '#9c27b0',
      background: '#ffffff',
      text: '#212121',
      muted: '#757575',
      accent: '#00bcd4',
      error: '#f44336',
      success: '#4caf50',
      warning: '#ff9800',
    },
  },
  {
    id: 'monokai',
    name: 'Monokai',
    isDark: true,
    colors: {
      primary: '#a6e22e',
      secondary: '#f92672',
      background: '#272822',
      text: '#f8f8f2',
      muted: '#75715e',
      accent: '#66d9ef',
      error: '#f92672',
      success: '#a6e22e',
      warning: '#e6db74',
    },
  },
  {
    id: 'dracula',
    name: 'Dracula',
    isDark: true,
    colors: {
      primary: '#bd93f9',
      secondary: '#ff79c6',
      background: '#282a36',
      text: '#f8f8f2',
      muted: '#6272a4',
      accent: '#8be9fd',
      error: '#ff5555',
      success: '#50fa7b',
      warning: '#f1fa8c',
    },
  },
  {
    id: 'nord',
    name: 'Nord',
    isDark: true,
    colors: {
      primary: '#88c0d0',
      secondary: '#b48ead',
      background: '#2e3440',
      text: '#eceff4',
      muted: '#4c566a',
      accent: '#81a1c1',
      error: '#bf616a',
      success: '#a3be8c',
      warning: '#ebcb8b',
    },
  },
];

export function getThemeById(id: string): Theme | undefined {
  return BUILTIN_THEMES.find(t => t.id === id);
}

export function getDefaultTheme(): Theme {
  return BUILTIN_THEMES[0];
}
