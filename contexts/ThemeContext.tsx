import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useMemo } from 'react';
import defaultColors from '@/constants/colors';

export interface ThemeSettings {
  logoSize: number;
  heroBackgroundColor: string;
  navSectionBackgroundColor: string;
  navSectionOpacity: number;
  primaryColor: string;
  accentColor: string;
  textColor: string;
  surfaceColor: string;
  buttonColor: string;
  playerCardBackgroundColor: string;
  tournamentCardBackgroundColor: string;
}

const DEFAULT_THEME: ThemeSettings = {
  logoSize: 168,
  heroBackgroundColor: '#F8FAFC',
  navSectionBackgroundColor: '#1E3A8A',
  navSectionOpacity: 0.5,
  primaryColor: '#1F2937',
  accentColor: '#F59E0B',
  textColor: '#1F2937',
  surfaceColor: '#FFFFFF',
  buttonColor: '#F8F8F8',
  playerCardBackgroundColor: '#C0C0C0',
  tournamentCardBackgroundColor: '#C0C0C0',
};

const STORAGE_KEY = 'horseshoe_theme_settings';

export const [ThemeContext, useTheme] = createContextHook(() => {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(DEFAULT_THEME);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      console.log('🎨 Loading theme settings...');
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.buttonColor) {
          console.log('🔄 Migrating theme: adding default button color');
          parsed.buttonColor = DEFAULT_THEME.buttonColor;
        }
        if (!parsed.playerCardBackgroundColor) {
          console.log('🔄 Migrating theme: adding default player card background color');
          parsed.playerCardBackgroundColor = DEFAULT_THEME.playerCardBackgroundColor;
        }
        if (!parsed.tournamentCardBackgroundColor) {
          console.log('🔄 Migrating theme: adding default tournament card background color');
          parsed.tournamentCardBackgroundColor = DEFAULT_THEME.tournamentCardBackgroundColor;
        }
        setThemeSettings(parsed);
        console.log('✅ Theme settings loaded:', parsed);
      } else {
        console.log('📝 No theme settings found, using defaults');
      }
    } catch (error) {
      console.error('❌ Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTheme = async (updates: Partial<ThemeSettings>) => {
    try {
      const newTheme = { ...themeSettings, ...updates };
      console.log('🎨 Updating theme settings...');
      console.log('Previous theme:', themeSettings);
      console.log('Updates:', updates);
      console.log('New theme:', newTheme);
      setThemeSettings(newTheme);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTheme));
      console.log('✅ Theme settings saved to AsyncStorage');
      
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      console.log('✅ Verified stored value:', stored);
    } catch (error) {
      console.error('❌ Error saving theme:', error);
    }
  };

  const resetTheme = async () => {
    try {
      setThemeSettings(DEFAULT_THEME);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_THEME));
      console.log('✅ Theme reset to defaults');
    } catch (error) {
      console.error('❌ Error resetting theme:', error);
    }
  };

  const colors = useMemo(() => {
    const colorScheme = {
      light: {
        ...defaultColors.light,
        text: themeSettings.textColor,
        surface: themeSettings.surfaceColor,
        tint: themeSettings.primaryColor,
        accent: themeSettings.accentColor,
        tabIconSelected: themeSettings.primaryColor,
        button: themeSettings.buttonColor,
        playerCardBackground: themeSettings.playerCardBackgroundColor,
        tournamentCardBackground: themeSettings.tournamentCardBackgroundColor,
      },
    };
    return colorScheme;
  }, [
    themeSettings.textColor,
    themeSettings.surfaceColor,
    themeSettings.primaryColor,
    themeSettings.accentColor,
    themeSettings.buttonColor,
    themeSettings.playerCardBackgroundColor,
    themeSettings.tournamentCardBackgroundColor,
  ]);

  return {
    themeSettings,
    colors,
    isLoading,
    updateTheme,
    resetTheme,
  };
});
