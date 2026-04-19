// Theme Engine

export const themes = {
  dark: {
    primary: 'cyan',
    secondary: 'magenta',
    success: 'green',
    error: 'red',
    warning: 'yellow',
    text: 'white',
    dim: 'gray'
  },
  light: {
    primary: 'blue',
    secondary: 'magenta',
    success: 'green',
    error: 'red',
    warning: 'yellow',
    text: 'black',
    dim: 'gray'
  }
};

export const getTheme = (name = 'dark') => themes[name] || themes.dark;

export default getTheme;
