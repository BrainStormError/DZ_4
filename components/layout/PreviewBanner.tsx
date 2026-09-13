'use client';

import { CalendarClock, RotateCcw } from 'lucide-react';
import { useAppDate } from '@/lib/date-context';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export function PreviewBanner() {
  const { isPreview, today, resetDate } = useAppDate();

  if (!isPreview) return null;

  return (
    <div className="border-b border-primary/30 bg-primary/10" role="status">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6 lg:px-8">
        <p className="text-sm flex items-center gap-2">
          <CalendarClock className="h-4 w-4 shrink-0 text-primary" />
          Режим предпросмотра: {format(today, 'd MMMM yyyy', { locale: ru })}. Реальные данные не
          изменяются.
        </p>
        <Button variant="outline" size="sm" onClick={resetDate} className="gap-1.5 shrink-0">
          <RotateCcw className="h-3.5 w-3.5" />
          Сбросить
        </Button>
      </div>
    </div>
  );
}
