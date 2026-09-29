'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ThemeSwitcher } from '@/components/layout/ThemeSwitcher';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Gift, AlertCircle, Loader2 } from 'lucide-react';

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.92l-3.88-3c-1.08.72-2.46 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.28a12 12 0 0 0 0 10.76l4.01-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.62l4.01 3.1C6.23 6.88 8.88 4.77 12 4.77z"
      />
    </svg>
  );
}

const ERROR_LABELS: Record<string, string> = {
  AccessDenied: 'Не удалось войти: Google не подтвердил адрес почты аккаунта.',
  Configuration:
    'Вход не настроен. Проверьте GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET и NEXTAUTH_SECRET.',
  OAuthSignin: 'Не удалось начать вход через Google. Попробуйте ещё раз.',
  OAuthCallback: 'Не удалось завершить вход через Google. Попробуйте ещё раз.',
  Verification: 'Ссылка для входа недействительна или устарела.',
  Default: 'Не удалось войти. Попробуйте ещё раз.',
};

export function LoginForm({ error }: { error?: string }) {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const errorMessage = error
    ? ERROR_LABELS[error] ?? ERROR_LABELS.Default
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login();
    } finally {
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
          <h1 className="font-heading text-3xl font-bold text-center">Корподарки</h1>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Поздравляйте коллег с днём рождения вместе
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Вход в систему</CardTitle>
            <CardDescription>
              Войдите с помощью аккаунта Google
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {errorMessage && (
                <Alert variant="destructive" role="alert">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" disabled={loading} className="w-full gap-2">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GoogleMark />
                )}
                Войти через Google
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
