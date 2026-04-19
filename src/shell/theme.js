// Theme — Claude Code inspired

export const themes = {
  dark: {
    brand:     '#D97706',
    user:      'white',
    claude:    '#60A5FA',
    codex:     '#34D399',
    system:    'gray',
    error:     '#F87171',
    warning:   '#FBBF24',
    dim:       'gray',
    separator: 'gray',
    prompt:    '#D97706',
  },
};

export const getTheme = (name = 'dark') => themes[name] || themes.dark;
export default getTheme;
