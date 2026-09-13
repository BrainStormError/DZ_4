'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cake, Gift } from 'lucide-react';
import type { User } from '@/lib/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface BirthdayCardProps {
  user: User;
  isToday?: boolean;
  year?: number;
  onDonate?: (user: User) => void;
  compact?: boolean;
}

export function BirthdayCard({ user, isToday, year, onDonate, compact }: BirthdayCardProps) {
  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const birthDate = new Date(user.birthDate);
  const formatted = year
    ? format(new Date(year, birthDate.getMonth(), birthDate.getDate()), 'd MMMM yyyy', { locale: ru })
    : format(birthDate, 'd MMMM', { locale: ru });

  return (
    <Card
      className={`card-shadow overflow-hidden transition-all hover:scale-[1.02] ${
        isToday ? 'ring-2 ring-primary' : ''
      }`}
    >
      <CardContent className={compact ? 'p-3' : 'p-4'}>
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <Avatar className={compact ? 'h-10 w-10' : 'h-14 w-14'}>
              <AvatarImage src={user.avatarUrl} alt={user.fullName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            {isToday && (
              <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px]">
                🎉
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold truncate ${compact ? 'text-sm' : 'text-base'}`}>
                {user.fullName}
              </h3>
              {isToday && (
                <Badge variant="default" className="text-[10px] py-0 px-1.5 shrink-0">
                  Сегодня
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <Cake className="h-3 w-3" />
              <span>{formatted}</span>
              <span className="text-border">·</span>
              <span className="truncate">{user.department}</span>
            </div>
          </div>
        </div>
        {!compact && onDonate && (
          <button
            onClick={() => onDonate(user)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <Gift className="h-4 w-4" />
            Поздравить
          </button>
        )}
      </CardContent>
    </Card>
  );
}
