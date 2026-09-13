import { Gift } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Gift className="h-4 w-4" />
            <span className="text-sm font-medium">Корподарки</span>
            <span className="text-sm">— добровольный сбор на подарки</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Участие добровольное.
          </p>
        </div>
      </div>
    </footer>
  );
}
