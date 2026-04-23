export interface ColorScheme {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  muted: string;
  accent: string;
  error: string;
  success: string;
  warning: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ColorScheme;
  isDark: boolean;
}

export interface AgentThemeOverride {
  provider: string;
  colors?: Partial<ColorScheme>;
}

export interface ThemeConfig {
  activeTheme: string;
  agentOverrides: AgentThemeOverride[];
}
