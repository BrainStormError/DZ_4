import type { ThemeKey } from './types';

export interface ThemeMeta {
  key: ThemeKey;
  label: string;
  description: string;
  emoji: string;
  palette: { name: string; hex: string }[];
}

export const THEMES: Record<ThemeKey, ThemeMeta> = {
  warm: {
    key: 'warm',
    label: 'Тёплый праздник',
    description: 'Уют, доброта, семейное тепло',
    emoji: '🎂',
    palette: [
      { name: 'Кремовый фон', hex: '#FFF8F0' },
      { name: 'Персиковый', hex: '#FFB088' },
      { name: 'Золото', hex: '#E8B86D' },
      { name: 'Тёплый текст', hex: '#5C4434' },
      { name: 'Розовый акцент', hex: '#F4A6B5' },
      { name: 'Мятный', hex: '#A8D5BA' },
    ],
  },
  festival: {
    key: 'festival',
    label: 'Корпоративный фестиваль',
    description: 'Драйв, движ, командный дух',
    emoji: '🎉',
    palette: [
      { name: 'Фуксия', hex: '#FF2E93' },
      { name: 'Коралловый', hex: '#FF6B5C' },
      { name: 'Тёплый жёлтый', hex: '#FFD93D' },
      { name: 'Акцентный фиолетовый', hex: '#9B5DE5' },
      { name: 'Тёмный фон', hex: '#1A0B2E' },
      { name: 'Белый текст', hex: '#FFFFFF' },
    ],
  },
  premium: {
    key: 'premium',
    label: 'Премиальный минимализм',
    description: 'Элегантно, дорого, с намёком на праздник',
    emoji: '✦',
    palette: [
      { name: 'Off-white', hex: '#FAFAF8' },
      { name: 'Глубокий изумруд', hex: '#0F5132' },
      { name: 'Бордо акцент', hex: '#7B1E2B' },
      { name: 'Тёмный текст', hex: '#1A1A1A' },
      { name: 'Серый', hex: '#8A8A8A' },
      { name: 'Золото-блёстки', hex: '#C9A961' },
    ],
  },
};

export const THEME_KEYS = Object.keys(THEMES) as ThemeKey[];

export const DEFAULT_THEME: ThemeKey = 'warm';
