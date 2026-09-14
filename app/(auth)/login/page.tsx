'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ThemeSwitcher } from '@/components/layout/ThemeSwitcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Gift, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.push('/');
  }, [user, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = login(email);
    if (!result.ok) {
      setError(result.error || 'Ошибка входа');
      setLoading(false);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative">
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Gift className="h-8 w-8" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-center">Корподарки</h1>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Поздравляйте коллег с днём рождения вместе
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Вход в систему</CardTitle>
            <CardDescription>
              Войдите с помощью корпоративной почты @company.com
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Корпоративная почта</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Вход...' : 'Войти'}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Это демо-режим. Попробуйте: anna.smirnova@company.com или alexander.petrov@company.com (админ)
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
