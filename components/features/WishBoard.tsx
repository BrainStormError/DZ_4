'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { mockUsers } from '@/lib/mock-data';
import type { Wish } from '@/lib/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface WishBoardProps {
  formOpen?: boolean;
  onFormOpenChange?: (open: boolean) => void;
}

export function WishBoard({ formOpen, onFormOpenChange }: WishBoardProps = {}) {
  const { user } = useAuth();
  const { wishes, addWish, updateWish } = useData();
  const [internalShowForm, setInternalShowForm] = useState(false);
  const [text, setText] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [editingWish, setEditingWish] = useState<Wish | null>(null);
  const [editText, setEditText] = useState('');

  const showForm = formOpen ?? internalShowForm;
  const setShowForm = (open: boolean) => {
    setInternalShowForm(open);
    onFormOpenChange?.(open);
  };

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  const sortedWishes = [...wishes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getUserByEmail = (email: string) => mockUsers.find((u) => u.email === email);
  const getUserById = (id: string) => mockUsers.find((u) => u.id === id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    if (!editingWish || !editText.trim()) return;
    updateWish(editingWish.id, editText.trim());
    setEditingWish(null);
    setEditText('');
  };

  const emailToNick = (email: string) => email.split('@')[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
            <MessageSquareHeart className="h-6 w-6 text-primary" />
            Доска пожеланий
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Автор отображается под корпоративным ником
          </p>
        </div>
        {formOpen === undefined && (
          <Button
            variant={showForm ? 'outline' : 'default'}
            onClick={() => setShowForm(!showForm)}
            size="sm"
          >
            {showForm ? 'Отмена' : 'Оставить пожелание'}
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="card-shadow">
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="target">Кому поздравление</Label>
                <Select value={targetUserId} onValueChange={setTargetUserId}>
                  <SelectTrigger id="target">
                    <SelectValue placeholder="Выберите сотрудника" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockUsers
                      .filter((u) => u.id !== user.id)
                      .map((u) => (
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
              <Button type="submit" disabled={!text.trim() || !targetUserId} className="self-start">
                <Send className="h-4 w-4 mr-1" />
                Отправить
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedWishes.map((wish) => {
          const author = getUserByEmail(wish.authorEmail);
          const target = getUserById(wish.targetUserId);
          return (
            <Card key={wish.id} className="card-shadow break-words">
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
                      aria-label="Изменить пожелание"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-7 w-7 shrink-0">
                      {author && <AvatarImage src={author.avatarUrl} alt={author.fullName} />}
                      <AvatarFallback className="text-xs">
                        {wish.authorEmail[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">
                        {emailToNick(wish.authorEmail)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {format(new Date(wish.createdAt), 'd MMM, HH:mm', { locale: ru })}
                      </p>
                    </div>
                  </div>
                  {target && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      → {target.fullName.split(' ')[0]}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {sortedWishes.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <MessageSquareHeart className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Пока нет пожеланий. Будьте первым!</p>
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
              <Button type="submit" disabled={!editText.trim()}>
                Сохранить
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
