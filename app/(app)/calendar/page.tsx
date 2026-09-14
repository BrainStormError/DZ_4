'use client';

import { useState, useMemo, useEffect } from 'react';
import { BirthdayCard } from '@/components/features/BirthdayCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CalendarDays } from 'lucide-react';
import { mockUsers } from '@/lib/mock-data';
import { useAppDate } from '@/lib/date-context';
import { parseIsoLocal } from '@/lib/birthdays';
import { pluralizeRu, prepositionalMonth } from '@/lib/utils';

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

export default function CalendarPage() {
  const { today } = useAppDate();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();

  const [year, setYear] = useState(todayYear);
  const [month, setMonth] = useState(todayMonth);

  useEffect(() => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  }, [today]);

  const birthdaysInMonth = useMemo(() => {
    return mockUsers
      .filter((u) => {
        const bd = parseIsoLocal(u.birthDate);
        if (bd.getMonth() !== month) return false;
        // Birthday exists only from the employee's birth year onward
        return year >= bd.getFullYear();
      })
      .sort((a, b) => parseIsoLocal(a.birthDate).getDate() - parseIsoLocal(b.birthDate).getDate());
  }, [month, year]);

  // Build calendar grid
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = (firstDayOfMonth.getDay() + 6) % 7; // Monday = 0

  const birthdaysByDay = useMemo(() => {
    const map: Record<number, typeof mockUsers> = {};
    birthdaysInMonth.forEach((u) => {
      const day = parseIsoLocal(u.birthDate).getDate();
      if (!map[day]) map[day] = [];
      map[day].push(u);
    });
    return map;
  }, [birthdaysInMonth]);

  const goPrevMonth = () => setMonth((m) => Math.max(0, m - 1));
  const goNextMonth = () => setMonth((m) => Math.min(11, m + 1));
  const goPrevYear = () => setYear((y) => y - 1);
  const goNextYear = () => setYear((y) => y + 1);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-primary" />
          Календарь дней рождений
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Дни рождения сотрудников в {year} году
        </p>
      </div>

      {/* Month and year navigation */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="outline" size="icon" onClick={goPrevYear} title="Предыдущий год">
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goPrevMonth}
            disabled={month === 0}
            title="Предыдущий месяц"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-heading text-xl font-bold min-w-[160px] text-center">
            {MONTHS[month]} {year}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={goNextMonth}
            disabled={month === 11}
            title="Следующий месяц"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goNextYear} title="Следующий год">
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
        <Badge variant="secondary">
          {birthdaysInMonth.length}{' '}
          {pluralizeRu(birthdaysInMonth.length, ['именинник', 'именинника', 'именинников'])}
        </Badge>
      </div>

      {/* Calendar grid */}
      <Card className="mb-8">
        <CardContent className="p-4">
          <div key={`${year}-${month}`} className="grid grid-cols-7 gap-1">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">
                {d}
              </div>
            ))}
            {Array.from({ length: startWeekday }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const hasBirthday = birthdaysByDay[day];
              const isToday = year === todayYear && month === todayMonth && day === todayDay;
              return (
                <div
                  key={day}
                  className={`relative min-h-[60px] sm:min-h-[80px] rounded-lg border p-1 sm:p-2 text-xs transition-colors ${
                    isToday
                      ? 'border-primary bg-primary/5'
                      : hasBirthday
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border'
                  }`}
                >
                  <span className={`font-medium ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                    {day}
                  </span>
                  {hasBirthday && (
                    <div className="mt-1 flex flex-col gap-0.5">
                      {hasBirthday.slice(0, 2).map((u) => (
                        <div
                          key={u.id}
                          className="truncate text-[10px] sm:text-xs text-foreground font-medium"
                          title={u.fullName}
                        >
                          <span className="mr-0.5">🎂</span>
                          {u.fullName.split(' ')[0]}
                        </div>
                      ))}
                      {hasBirthday.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{hasBirthday.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Birthday list for month */}
      {birthdaysInMonth.length > 0 && (
        <div>
          <h3 className="font-heading text-lg font-semibold mb-4">
            Именинники в {prepositionalMonth(month)} {year}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {birthdaysInMonth.map((u) => {
              const bd = parseIsoLocal(u.birthDate);
              const isToday =
                year === todayYear && month === todayMonth && bd.getDate() === todayDay;
              return <BirthdayCard key={u.id} user={u} year={year} isToday={isToday} />;
            })}
          </div>
        </div>
      )}

      {birthdaysInMonth.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <CalendarDays className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-sm text-muted-foreground">
              В {prepositionalMonth(month)} {year} нет дней рождений
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
