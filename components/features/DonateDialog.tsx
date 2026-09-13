'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Gift, Mail, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import type { User } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { useData } from '@/lib/data-context';
import { checkCorpEmail } from '@/lib/corp-email';
import { mockUsers } from '@/lib/mock-data';
import { parsePositiveInt } from '@/lib/utils';

interface DonateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUser: User | null;
}

type Step = 'recipient' | 'email' | 'amount' | 'message' | 'confirm' | 'success';

export function DonateDialog({ open, onOpenChange, targetUser }: DonateDialogProps) {
  const { user } = useAuth();
  const { addDonation, addWish } = useData();
  const [step, setStep] = useState<Step>('recipient');
  const [recipient, setRecipient] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [amount, setAmount] = useState('');
  const [wishText, setWishText] = useState('');

  // Employee never sees collected totals — only own contribution
  const isAdmin = user?.role === 'admin';
  const parsedAmount = parsePositiveInt(amount);
  const displayAmount = parsedAmount ?? 0;
  const canConfirm = !!recipient && parsedAmount !== null;
  const recipientName = recipient?.fullName ?? '';
  const recipientOptions = mockUsers.filter((u) => u.id !== user?.id);

  useEffect(() => {
    if (open) {
      setRecipient(targetUser);
      setStep(targetUser ? 'email' : 'recipient');
      setEmail(user?.email ?? '');
      setEmailError('');
      setAmount('');
      setWishText('');
    }
  }, [open, targetUser, user?.email]);

  const handleRecipientSelect = (id: string) => {
    setRecipient(mockUsers.find((u) => u.id === id) ?? null);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient) {
      setEmailError('Сначала выберите получателя');
      return;
    }
    const result = checkCorpEmail(email);
    if (!result.ok) {
      setEmailError(result.error || 'Некорректный адрес почты');
      return;
    }
    if (result.user?.id !== user?.id) {
      setEmailError('Укажите свою корпоративную почту: отправитель должен совпадать с текущим пользователем');
      return;
    }
    setEmailError('');
    setStep('amount');
  };

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || parsedAmount === null) return;
    setStep(isAdmin ? 'confirm' : 'message');
  };

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !wishText.trim()) return;
    setStep('confirm');
  };

  const handleConfirm = () => {
    if (!recipient || !user || parsedAmount === null) return;
    addDonation(recipient.id, parsedAmount);
    if (!isAdmin && wishText.trim()) {
      addWish({
        authorEmail: user.email,
        targetUserId: recipient.id,
        text: wishText.trim(),
      });
    }
    setStep('success');
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === 'recipient' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                Поздравить сотрудника
              </DialogTitle>
              <DialogDescription>
                Выберите получателя, чтобы продолжить участие
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="donate-recipient">Получатель</Label>
                <Select value={recipient?.id ?? ''} onValueChange={handleRecipientSelect}>
                  <SelectTrigger id="donate-recipient" autoFocus>
                    <SelectValue placeholder="Выберите сотрудника" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipientOptions.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.fullName} — {u.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                disabled={!recipient}
                onClick={() => recipient && setStep('email')}
              >
                Продолжить
              </Button>
            </div>
          </>
        )}

        {step === 'email' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                Поздравить сотрудника
              </DialogTitle>
              <DialogDescription>
                {recipient ? `Получатель: ${recipientName}` : 'Выберите получателя'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="donate-email">Ваша корпоративная почта</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="donate-email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                    autoFocus
                  />
                </div>
              </div>
              {emailError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{emailError}</AlertDescription>
                </Alert>
              )}
              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Участие добровольное</p>
                <p>Поздравить без взноса можно на доске пожеланий — кнопкой «Оставить пожелание». Сумма сбора видна только администратору.</p>
              </div>
              <Button type="submit">Продолжить</Button>
            </form>
          </>
        )}

        {step === 'amount' && (
          <>
            <DialogHeader>
              <DialogTitle>{isAdmin ? 'Укажите сумму' : 'Ваш вклад'}</DialogTitle>
              <DialogDescription>
                {isAdmin
                  ? `Получатель: ${recipientName}. Средства будут добавлены к сбору.`
                  : `Получатель: ${recipientName}. Сумма добавится к сбору; итоговая сумма скрыта от сотрудников.`}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAmountSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="amount">Сумма (₽)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" disabled={parsedAmount === null}>
                Продолжить
              </Button>
            </form>
          </>
        )}

        {step === 'message' && !isAdmin && (
          <>
            <DialogHeader>
              <DialogTitle>Поздравление</DialogTitle>
              <DialogDescription>
                Получатель: {recipientName}. Тёплые слова появятся на доске пожеланий.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleMessageSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="wish-text">Текст поздравления</Label>
                <Textarea
                  id="wish-text"
                  placeholder="Напишите тёплые слова..."
                  value={wishText}
                  onChange={(e) => setWishText(e.target.value)}
                  rows={3}
                  required
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setStep('amount')}>
                  Назад
                </Button>
                <Button type="submit" disabled={!wishText.trim()}>
                  Продолжить
                </Button>
              </DialogFooter>
            </form>
          </>
        )}

        {step === 'confirm' && (
          <>
            <DialogHeader>
              <DialogTitle>Подтверждение</DialogTitle>
              <DialogDescription>Проверьте данные перед отправкой</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 py-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">От:</span>
                <span className="font-medium">{email}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Получатель:</span>
                <span className="font-medium">{recipientName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{isAdmin ? 'Сумма:' : 'Ваш вклад:'}</span>
                <span className="font-medium">{displayAmount} ₽</span>
              </div>
              {!isAdmin && wishText.trim() && (
                <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
                  <span className="text-xs text-muted-foreground">Поздравление</span>
                  <span className="text-sm">{wishText.trim()}</span>
                </div>
              )}
              {!isAdmin && (
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                  <Lock className="h-4 w-4 shrink-0" />
                  <span>Итоговая сумма сбора скрыта. Ваше пожелание будет отправлено на доску.</span>
                </div>
              )}
              {!canConfirm && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {!recipient
                      ? 'Не выбран получатель — отправка недоступна.'
                      : 'Некорректная сумма — отправка недоступна.'}
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setStep(isAdmin ? 'amount' : 'message')}
              >
                Назад
              </Button>
              <Button onClick={handleConfirm} disabled={!canConfirm}>
                <Gift className="h-4 w-4 mr-1" />
                {isAdmin ? 'Отправить' : 'Поздравить'}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'success' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Готово!
              </DialogTitle>
              <DialogDescription>
                {isAdmin
                  ? `Получатель: ${recipientName}. Сумма добавлена к сбору.`
                  : `Получатель: ${recipientName}. Поздравление отправлено.`}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Gift className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                {isAdmin
                  ? 'Сумма добавлена к сбору. Спасибо за участие!'
                  : 'Спасибо за участие! Поздравление будет передано имениннику.'}
              </p>
            </div>
            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Закрыть
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
