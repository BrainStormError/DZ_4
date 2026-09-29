'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeSwitcher } from '@/components/layout/ThemeSwitcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Gift, AlertCircle, Loader2 } from 'lucide-react';

export function RegistrationForm({
  email,
  defaultFullName,
}: {
  email: string;
  defaultFullName: string;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(defaultFullName);
  const [birthDate, setBirthDate] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit =
    fullName.trim().length > 0 &&
    birthDate.trim().length > 0 &&
    department.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;

    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          birthDate: birthDate.trim(),
          department: department.trim(),
        }),
      });
      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      if (!response.ok) {
        setError(data?.error || 'Не удалось завершить регистрацию.');
        setLoading(false);
        return;
      }
      router.replace('/');
      router.refresh();
    } catch {
      setError('Не удалось завершить регистрацию. Попробуйте ещё раз.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8 relative">
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Gift className="h-8 w-8" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-center">Регистрация</h1>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Заполните профиль, чтобы присоединиться
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Ваш профиль</CardTitle>
            <CardDescription>
              Аккаунт Google подтверждён. Укажите недостающие данные.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="reg-email">Почта Google</Label>
                <Input
                  id="reg-email"
                  type="email"
                  value={email}
                  readOnly
                  aria-readonly="true"
                  tabIndex={-1}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="reg-full-name">Полное имя</Label>
                <Input
                  id="reg-full-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Имя и фамилия"
                  required
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="reg-birth-date">Дата рождения</Label>
                <Input
                  id="reg-birth-date"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="reg-department">Отдел</Label>
                <Input
                  id="reg-department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Например, Разработка"
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive" role="alert">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" disabled={!canSubmit || loading} className="w-full">
                {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                Завершить регистрацию
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
