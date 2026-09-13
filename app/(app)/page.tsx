'use client';

import { useState, useMemo, useEffect } from 'react';
import { BirthdayCard } from '@/components/features/BirthdayCard';
import { WishBoard } from '@/components/features/WishBoard';
import { DonateDialog } from '@/components/features/DonateDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Gift, Users } from 'lucide-react';
import { mockUsers } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth-context';
import type { User } from '@/lib/types';

export default function HomePage() {
  const { user } = useAuth();
  const [donateOpen, setDonateOpen] = useState(false);
  const [donateTarget, setDonateTarget] = useState<User | null>(null);
  const [wishFormOpen, setWishFormOpen] = useState(false);

  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    setToday(new Date());
  }, []);

  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  const todayBirthdays = useMemo(
    () =>
      mockUsers.filter((u) => {
        const bd = new Date(u.birthDate);
        return bd.getMonth() + 1 === todayMonth && bd.getDate() === todayDay;
      }),
    [todayMonth, todayDay]
  );

  const upcomingBirthdays = useMemo(() => {
    const rest = mockUsers.filter((u) => {
      const bd = new Date(u.birthDate);
      const bdThisYear = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
      return bdThisYear.getTime() > today.getTime() && bdThisYear.getTime() <= today.getTime() + 30 * 24 * 60 * 60 * 1000;
    });
    return rest.sort((a, b) => {
      const aDate = new Date(today.getFullYear(), new Date(a.birthDate).getMonth(), new Date(a.birthDate).getDate());
      const bDate = new Date(today.getFullYear(), new Date(b.birthDate).getMonth(), new Date(b.birthDate).getDate());
      return aDate.getTime() - bDate.getTime();
    });
  }, [today]);

  const handleDonate = (u?: User) => {
    setDonateTarget(u || null);
    setDonateOpen(true);
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-card card-shadow mb-8">
        <div className="hero-overlay absolute inset-0" />
        <div className="relative px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
          <div className="flex flex-col items-start gap-4 max-w-2xl">
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Корпоративные подарки
              <br />
              <span className="text-primary">ко дню рождения</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Мы собираем средства на подарки коллегам к их дню рождения.
              Любой сотрудник может присоединиться — но это <strong className="text-foreground">полностью добровольно</strong>.
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              <Button size="lg" onClick={() => handleDonate()} className="gap-2">
                <Gift className="h-5 w-5" />
                Поздравить / отправить средства
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                onClick={() => {
                  setWishFormOpen(true);
                  document.getElementById('wish-board')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Heart className="h-5 w-5" />
                Оставить пожелание
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Team value */}
      <section className="mb-10">
        <Card className="card-shadow">
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
              <BirthdayCard key={u.id} user={u} isToday onDonate={handleDonate} />
            ))}
          </div>
        ) : (
          <Card className="card-shadow">
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
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {upcomingBirthdays.slice(0, 4).map((u) => (
              <BirthdayCard key={u.id} user={u} compact onDonate={handleDonate} />
            ))}
          </div>
        </section>
      )}

      {/* Wish board */}
      <section className="mb-10" id="wish-board">
        <WishBoard formOpen={wishFormOpen} onFormOpenChange={setWishFormOpen} />
      </section>

      <DonateDialog open={donateOpen} onOpenChange={setDonateOpen} targetUser={donateTarget} />
    </div>
  );
}
