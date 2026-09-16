import { Gift } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left text-muted-foreground">
            <span className="flex items-center gap-2">
              <Gift className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium">Корподарки</span>
            </span>
            <span className="text-sm">
              <span className="hidden sm:inline" aria-hidden="true">
                —{' '}
              </span>
              сбор на подарки коллегам
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
