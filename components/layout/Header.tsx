'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useData } from '@/lib/data-context';
import { countUnreadThreads } from '@/lib/data-store';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Gift, Home, CalendarDays, HelpCircle, Shield, LogOut, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Главная', icon: Home },
  { href: '/calendar', label: 'Календарь ДР', icon: CalendarDays },
  { href: '/faq', label: 'FAQ', icon: HelpCircle },
];

export function Header() {
  const { user, logout } = useAuth();
  const { chats } = useData();
  const pathname = usePathname();

  if (!user) return null;

  const unreadCount = user.role === 'admin' ? countUnreadThreads(chats) : 0;

  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const renderNav = (linkClassName: string, iconClassName: string) => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              linkClassName,
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <Icon className={iconClassName} />
            {item.label}
          </Link>
        );
      })}
      {user.role === 'admin' && (
        <Link
          href="/admin"
          className={cn(
            linkClassName,
            pathname === '/admin'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          <Shield className={iconClassName} />
          Админ
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Gift className="h-5 w-5" />
            </div>
            <span className="font-heading text-lg font-bold hidden sm:inline">
              Корподарки
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {renderNav(
              'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
              'h-4 w-4'
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {unreadCount > 0 && (
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="relative"
              aria-label={`Непрочитанных сообщений: ${unreadCount}`}
            >
              <Link href="/faq?tab=messages">
                <MessageCircle className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                  {unreadCount}
                </span>
              </Link>
            </Button>
          )}
          <ThemeSwitcher />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                aria-label={`Меню пользователя: ${user.fullName}`}
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium">
                  {user.fullName.split(' ')[0]}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col gap-1">
                <span>{user.fullName}</span>
                <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="gap-2 text-destructive">
                <LogOut className="h-4 w-4" />
                Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Mobile nav */}
      <nav className="md:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto">
        {renderNav(
          'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap',
          'h-3.5 w-3.5'
        )}
      </nav>
    </header>
  );
}
