import { Shield } from 'lucide-react';

export function AdminAccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Shield className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-lg font-semibold">Доступ запрещён</p>
      <p className="text-sm text-muted-foreground">Эта страница только для администраторов</p>
    </div>
  );
}
