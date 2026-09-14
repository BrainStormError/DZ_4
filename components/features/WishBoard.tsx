'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageSquareHeart, Send, Pencil } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useData } from '@/lib/data-context';
import { useAppDate } from '@/lib/date-context';
import { mockUsers } from '@/lib/mock-data';
import { getBoardDate, getPersonColors, getTodayBirthdays } from '@/lib/birthdays';
import type { Wish } from '@/lib/types';

interface WishBoardProps {
  formOpen?: boolean;
  onFormOpenChange?: (open: boolean) => void;
}

export function WishBoard({ formOpen, onFormOpenChange }: WishBoardProps = {}) {
  const { user } = useAuth();
  const { wishes, addWish, updateWish } = useData();
  const { today, isPreview } = useAppDate();
  const [internalShowForm, setInternalShowForm] = useState(false);
  const [text, setText] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [editingWish, setEditingWish] = useState<Wish | null>(null);
  const [editText, setEditText] = useState('');
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const pathname = usePathname();

  const board = useMemo(() => getBoardDate(today, mockUsers), [today]);

  const boardWishes = useMemo(() => {
    const targetIds = new Set(board.users.map((u) => u.id));
    return wishes
      .filter((w) => targetIds.has(w.targetUserId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [wishes, board.users]);

  const colorByUserId = useMemo(() => getPersonColors(board.users), [board.users]);

  const todayBirthdayUsers = useMemo(() => getTodayBirthdays(today, mockUsers), [today]);
  const wishRecipients = useMemo(
    () => todayBirthdayUsers.filter((u) => u.id !== user?.id),
    [todayBirthdayUsers, user?.id]
  );
  const canCongratulate = todayBirthdayUsers.length > 0;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setPrefersReducedMotion(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number | null = null;
    const measure = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const list = listRef.current;
        if (!list) return;
        setIsOverflowing((prev) => {
          const next = list.scrollWidth > container.clientWidth + 1;
          return next === prev ? prev : next;
        });
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => {
      observer.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [boardWishes, prefersReducedMotion]);

  useEffect(() => {
    setEditingWish(null);
  }, [pathname]);

  const isLooping = isOverflowing && !prefersReducedMotion;

  const showForm = formOpen ?? internalShowForm;
  const setShowForm = (open: boolean) => {
    setInternalShowForm(open);
    onFormOpenChange?.(open);
  };

  useEffect(() => {
    if (showForm && wishRecipients.length === 1) {
      setTargetUserId(wishRecipients[0].id);
    }
  }, [showForm, wishRecipients]);

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  const getUserByEmail = (email: string) => mockUsers.find((u) => u.email === email);
  const getUserById = (id: string) => mockUsers.find((u) => u.id === id);
  const emailToNick = (email: string) => email.split('@')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) return;
    if (!text.trim() || !targetUserId) return;
    addWish({
      authorEmail: user.email,
      targetUserId,
      text: text.trim(),
    });
    setText('');
    setTargetUserId('');
    setShowForm(false);
  };

  const handleEditOpen = (wish: Wish) => {
    setEditingWish(wish);
    setEditText(wish.text);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) return;
    if (!editingWish || !editText.trim()) return;
    updateWish(editingWish.id, editText.trim());
    setEditingWish(null);
    setEditText('');
  };

  const renderCard = (wish: Wish) => {
    const author = getUserByEmail(wish.authorEmail);
    const target = getUserById(wish.targetUserId);
    const color = colorByUserId.get(wish.targetUserId);
    return (
      <Card
        className="card-shadow break-words h-full"
        style={color ? { borderTopColor: color, borderTopWidth: 4 } : undefined}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <p className="text-sm leading-relaxed">{wish.text}</p>
            {isAdmin && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground"
                onClick={() => handleEditOpen(wish)}
                disabled={isPreview}
                aria-label="Изменить пожелание"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-1 pt-3 border-t border-border">
            <p className="text-xs font-medium truncate">
              От:{' '}
              {author ? author.fullName : emailToNick(wish.authorEmail)}{' '}
              <span className="font-normal text-muted-foreground">
                ({emailToNick(wish.authorEmail)})
              </span>
            </p>
            {target && (
              <p className="text-xs text-muted-foreground truncate">Кому: {target.fullName}</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
            <MessageSquareHeart className="h-6 w-6 text-primary" />
            Доска пожеланий
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Поздравления появляются в день рождения получателя
          </p>
        </div>
        {formOpen === undefined && (
          <div className="flex flex-col items-end gap-1">
            <Button
              variant={showForm ? 'outline' : 'default'}
              onClick={() => setShowForm(!showForm)}
              size="sm"
              disabled={isPreview || (!showForm && !canCongratulate)}
            >
              {showForm ? 'Отмена' : 'Оставить пожелание'}
            </Button>
            {!showForm && !canCongratulate && (
              <p className="text-xs text-muted-foreground max-w-[220px] text-right">
                Сегодня именинников нет — пожелание доступно только в день рождения.
              </p>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <Card className="card-shadow">
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="rounded-lg bg-muted/50 p-3 text-xs">
                <p className="font-medium text-foreground">
                  От: {user.fullName} ({emailToNick(user.email)})
                </p>
                <p className="text-muted-foreground mt-0.5">
                  Пожелание будет отправлено от вашего имени.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="target">Кого поздравляем</Label>
                <Select value={targetUserId} onValueChange={setTargetUserId}>
                  <SelectTrigger id="target">
                    <SelectValue placeholder="Выберите сотрудника" />
                  </SelectTrigger>
                  <SelectContent>
                    {wishRecipients.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.fullName} — {u.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="wish-text">Ваше пожелание</Label>
                <Textarea
                  id="wish-text"
                  placeholder="Напишите тёплые слова..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={3}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={!text.trim() || !targetUserId || isPreview}
                className="self-start"
              >
                <Send className="h-4 w-4 mr-1" />
                Отправить
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {board.users.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Поздравления: {board.users.map((u) => u.fullName).join(', ')}
        </p>
      )}

      {boardWishes.length > 0 ? (
        <div
          ref={containerRef}
          className="wish-marquee overflow-x-auto pb-2"
          tabIndex={0}
          aria-label="Лента поздравлений"
        >
          <div className={`flex w-max ${isLooping ? 'wish-marquee-track wish-marquee-track--looping' : ''}`}>
            <ul ref={listRef} className="flex w-max gap-4 pr-4">
              {boardWishes.map((wish) => (
                <li key={wish.id} className="w-[280px] sm:w-[320px] shrink-0">
                  {renderCard(wish)}
                </li>
              ))}
            </ul>
            {isLooping && (
              <ul aria-hidden className="flex w-max gap-4 pr-4">
                {boardWishes.map((wish) => (
                  <li key={`${wish.id}-copy`} className="w-[280px] sm:w-[320px] shrink-0">
                    {renderCard(wish)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <MessageSquareHeart className="h-12 w-12 mx-auto mb-3 opacity-30" />
          {board.users.length === 0 ? (
            <p>Ближайших прошедших дней рождения нет. Загляните позже!</p>
          ) : (
            <p>Пока нет пожеланий. Будьте первым!</p>
          )}
        </div>
      )}

      <Dialog open={!!editingWish} onOpenChange={(open) => !open && setEditingWish(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Изменить пожелание</DialogTitle>
            <DialogDescription>
              Отредактируйте текст — автор, получатель и время создания не изменятся.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-wish-text">Текст пожелания</Label>
              <Textarea
                id="edit-wish-text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                required
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingWish(null)}>
                Отмена
              </Button>
              <Button type="submit" disabled={!editText.trim() || isPreview}>
                Сохранить
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
