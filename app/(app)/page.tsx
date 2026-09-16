'use client';

import { useState, useMemo } from 'react';
import { BirthdayCard } from '@/components/features/BirthdayCard';
import { WishBoard } from '@/components/features/WishBoard';
import { DonateDialog } from '@/components/features/DonateDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Gift, Users } from 'lucide-react';
import { mockUsers } from '@/lib/mock-data';
import { useAppDate } from '@/lib/date-context';
import { getPersonColors, getTodayBirthdays, parseIsoLocal } from '@/lib/birthdays';
import type { User } from '@/lib/types';

export default function HomePage() {
  const { today, isPreview } = useAppDate();
  const [donateOpen, setDonateOpen] = useState(false);
  const [donateTarget, setDonateTarget] = useState<User | null>(null);
  const [wishFormOpen, setWishFormOpen] = useState(false);

  const todayBirthdays = useMemo(() => getTodayBirthdays(today, mockUsers), [today]);

  const todayBirthdayColors = useMemo(
    () => getPersonColors(todayBirthdays),
    [todayBirthdays]
  );

  const hasTodayBirthdays = todayBirthdays.length > 0;

  const upcomingBirthdays = useMemo(() => {
    const horizon = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
    const rest = mockUsers.filter((u) => {
      const bd = parseIsoLocal(u.birthDate);
      const bdThisYear = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
      return bdThisYear.getTime() > today.getTime() && bdThisYear.getTime() <= horizon.getTime();
    });
    return rest.sort((a, b) => {
      const aBd = parseIsoLocal(a.birthDate);
      const bBd = parseIsoLocal(b.birthDate);
      const aDate = new Date(today.getFullYear(), aBd.getMonth(), aBd.getDate());
      const bDate = new Date(today.getFullYear(), bBd.getMonth(), bBd.getDate());
      return aDate.getTime() - bDate.getTime();
    });
  }, [today]);

  const handleDonate = (u?: User) => {
    setDonateTarget(u || null);
    setDonateOpen(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-card mb-8">
        <div className="hero-overlay absolute inset-0" />
        <div className="relative px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
          <div className="flex flex-col items-start gap-4 max-w-2xl">
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Корпоративные подарки
              <br />
              <span className="text-primary">ко дню рождения</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Мы собираем средства на подарки коллегам к их дню рождения. Любой сотрудник может
              присоединиться — это добровольно.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Button
                size="lg"
                onClick={() => handleDonate()}
                className="gap-2 w-full sm:w-auto whitespace-normal h-auto min-h-11 py-2.5 px-5 sm:px-8"
                disabled={isPreview}
              >
                <Gift className="h-5 w-5" />
                Поздравить / отправить средства
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 w-full sm:w-auto whitespace-normal h-auto min-h-11 py-2.5 px-5 sm:px-8"
                disabled={isPreview || !hasTodayBirthdays}
                onClick={() => {
                  setWishFormOpen(true);
                  document.getElementById('wish-board')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Heart className="h-5 w-5" />
                Оставить пожелание
              </Button>
            </div>
            {!hasTodayBirthdays && (
              <p className="text-xs text-muted-foreground">
                Сегодня именинников нет — пожелание доступно только в день рождения, а поздравить
                заранее можно денежным взносом.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Team value */}
      <section className="mb-10">
        <Card>
          <CardContent className="p-5 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Команда — это важно</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Каждый подарок — знак внимания от коллег.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Today's birthdays */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
            <span className="text-2xl">🎂</span>
            Именинники сегодня
          </h2>
        </div>
        {todayBirthdays.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {todayBirthdays.map((u) => (
              <BirthdayCard
                key={u.id}
                user={u}
                isToday
                accentColor={todayBirthdayColors.get(u.id)}
                onDonate={handleDonate}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-4xl mb-3">🎈</p>
              <p className="text-sm text-muted-foreground">
                Сегодня именинников нет. Загляните в календарь, чтобы не пропустить ближайший день рождения!
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Upcoming birthdays */}
      {upcomingBirthdays.length > 0 && (
        <section className="mb-10">
          <h2 className="font-heading text-2xl font-bold mb-4">Скоро день рождения</h2>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {upcomingBirthdays.slice(0, 4).map((u) => (
              <BirthdayCard key={u.id} user={u} compact onDonate={handleDonate} />
            ))}
          </div>
        </section>
      )}

      {/* Wish board */}
      <section className="mb-10 scroll-mt-20" id="wish-board">
        <WishBoard formOpen={wishFormOpen} onFormOpenChange={setWishFormOpen} />
      </section>

      <DonateDialog open={donateOpen} onOpenChange={setDonateOpen} targetUser={donateTarget} />
    </div>
  );
}
