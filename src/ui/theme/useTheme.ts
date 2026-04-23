import React from 'react';

import { BUILTIN_THEMES, getDefaultTheme, getThemeById } from './builtinThemes.js';
import { clearThemeConfig, loadThemeConfig, saveThemeConfig } from './themeStorage.js';
import { validateThemeConfig } from '../../config/validation.js';
import type { AgentThemeOverride, ColorScheme, ThemeConfig } from './themeTypes.js';

export function useTheme() {
  const [config, setConfig] = React.useState<ThemeConfig>(() => {
    const saved = loadThemeConfig();
    if (saved) {
      const validation = validateThemeConfig(saved);
      if (!validation.isValid) {
        console.warn('Invalid theme config, using defaults:', validation.errors);
        return { activeTheme: getDefaultTheme().id, agentOverrides: [] };
      }
      return saved;
    }
    return { activeTheme: getDefaultTheme().id, agentOverrides: [] };
  });

  const activeTheme = React.useMemo(() => {
    return getThemeById(config.activeTheme) || getDefaultTheme();
  }, [config.activeTheme]);

  const setTheme = React.useCallback((themeId: string) => {
    setConfig(prev => {
      const newConfig = { ...prev, activeTheme: themeId };
      const validation = validateThemeConfig(newConfig);
      if (validation.isValid) {
        saveThemeConfig(newConfig);
      } else {
        console.warn('Invalid theme config:', validation.errors);
      }
      return newConfig;
    });
  }, []);

  const setAgentOverride = React.useCallback((provider: string, colors: Partial<ColorScheme>) => {
    setConfig(prev => {
      const existingIndex = prev.agentOverrides.findIndex(o => o.provider === provider);
      let newOverrides: AgentThemeOverride[];

      if (existingIndex >= 0) {
        newOverrides = [...prev.agentOverrides];
        newOverrides[existingIndex] = { provider, colors };
      } else {
        newOverrides = [...prev.agentOverrides, { provider, colors }];
      }

      const newConfig = { ...prev, agentOverrides: newOverrides };
      const validation = validateThemeConfig(newConfig);
      if (validation.isValid) {
        saveThemeConfig(newConfig);
      } else {
        console.warn('Invalid theme config:', validation.errors);
      }
      return newConfig;
    });
  }, []);

  const removeAgentOverride = React.useCallback((provider: string) => {
    setConfig(prev => {
      const newOverrides = prev.agentOverrides.filter(o => o.provider !== provider);
      const newConfig = { ...prev, agentOverrides: newOverrides };
      const validation = validateThemeConfig(newConfig);
      if (validation.isValid) {
        saveThemeConfig(newConfig);
      } else {
        console.warn('Invalid theme config:', validation.errors);
      }
      return newConfig;
    });
  }, []);

  const getColorsForProvider = React.useCallback(
    (provider: string): ColorScheme => {
      const override = config.agentOverrides.find(o => o.provider === provider);
      if (!override) return activeTheme.colors;

      return { ...activeTheme.colors, ...override.colors };
    },
    [activeTheme.colors, config.agentOverrides]
  );

  const resetTheme = React.useCallback(() => {
    const defaultTheme = getDefaultTheme();
    setConfig({ activeTheme: defaultTheme.id, agentOverrides: [] });
    clearThemeConfig();
  }, []);

  return {
    activeTheme,
    allThemes: BUILTIN_THEMES,
    setTheme,
    setAgentOverride,
    removeAgentOverride,
    getColorsForProvider,
    resetTheme,
    agentOverrides: config.agentOverrides,
  };
}
