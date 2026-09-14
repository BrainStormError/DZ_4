'use client';

import { useTheme } from '@/lib/theme-context';
import { THEMES, THEME_KEYS } from '@/lib/theme';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Palette } from 'lucide-react';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" aria-label="Сменить тему">
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">
            {THEMES[theme].label}
          </span>
          <span className="sm:hidden">
            {THEMES[theme].emoji}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Визуальная концепция</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {THEME_KEYS.map((key) => (
          <DropdownMenuItem
            key={key}
            onClick={() => setTheme(key)}
            className="flex items-start gap-3 py-3"
          >
            <span className="text-xl leading-none mt-0.5">{THEMES[key].emoji}</span>
            <div className="flex flex-col">
              <span className={`text-sm font-semibold ${theme === key ? 'text-primary' : ''}`}>
                {THEMES[key].label}
              </span>
              <span className="text-xs text-muted-foreground">{THEMES[key].description}</span>
            </div>
            {theme === key && (
              <span className="ml-auto text-primary text-xs">●</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
