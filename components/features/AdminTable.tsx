'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Shield, Edit, AlertTriangle, CalendarClock, CalendarDays, ChevronLeft, ChevronRight, RotateCcw, Loader2, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { DayPicker } from 'react-day-picker';
import { useAuth } from '@/lib/auth-context';
import { useDonations } from '@/lib/data-context';
import { useAppDate } from '@/lib/date-context';
import { useAsyncAction } from '@/lib/hooks';
import { mockUsers } from '@/lib/mock-data';
import { isGiftDeclined, reasonLabel } from '@/lib/data-store';
import { parseIsoLocal } from '@/lib/birthdays';
import { parseNonNegativeInt } from '@/lib/utils';
import type { RefundReason, User, DonationHistoryEntry } from '@/lib/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const DAY_PICKER_CLASSNAMES = {
  months: 'flex flex-col',
  month: 'space-y-4',
  caption: 'flex justify-center pt-1 relative items-center',
  caption_label: 'text-sm font-medium',
  nav: 'space-x-1 flex items-center',
  nav_button:
    'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-input',
  nav_button_previous: 'absolute left-1',
  nav_button_next: 'absolute right-1',
  table: 'w-full border-collapse space-y-1',
  head_row: 'flex',
  head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
  row: 'flex w-full mt-2',
  cell: 'h-9 w-9 text-center text-sm p-0 relative',
  day: 'h-9 w-9 p-0 font-normal inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground',
  day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
  day_today: 'bg-accent text-accent-foreground',
  day_outside: 'text-muted-foreground opacity-50',
  day_disabled: 'text-muted-foreground opacity-50',
  day_hidden: 'invisible',
};

export function AdminTable() {
  const { user, ready } = useAuth();
  const { donations, history, setGiftSent, updateDonation } = useDonations();
  const { today, isPreview, previewDate, setPreviewDate, resetDate } = useAppDate();
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editReason, setEditReason] = useState<RefundReason | ''>('');
  const [editComment, setEditComment] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [view, setView] = useState<'table' | 'history'>('table');
  const [giftPendingId, setGiftPendingId] = useState<string | null>(null);
  const pathname = usePathname();

  const giftAction = useAsyncAction(
    async (args: { userId: string; sent: boolean }) =>
      Promise.resolve(setGiftSent(args.userId, args.sent)),
    {
      onSuccess: () => toast.success('Статус обновлён'),
      onError: (e) => toast.error(e.message),
    }
  );

  const updateAction = useAsyncAction(
    async (entry: Omit<DonationHistoryEntry, 'id' | 'createdAt'>) =>
      Promise.resolve(updateDonation(entry)),
    {
      onSuccess: () => {
        toast.success('Сумма обновлена');
        setEditTarget(null);
      },
    }
  );

  useEffect(() => {
    setEditTarget(null);
  }, [pathname]);

  if (!ready) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true">
        <div className="h-8 w-56 rounded-md bg-muted" />
        <div className="min-h-[70vh] rounded-lg border border-border bg-muted/30" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Shield className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-semibold">Доступ запрещён</p>
        <p className="text-sm text-muted-foreground">Эта страница только для администраторов</p>
      </div>
    );
  }

  const getUserById = (id: string) => mockUsers.find((u) => u.id === id);
  const getDonation = (userId: string) =>
    donations.find((d) => d.userId === userId) || { userId, totalAmount: 0, giftSent: false };

  const parsedEditAmount = parseNonNegativeInt(editAmount);
  const isDeclinedRefund = editReason === 'refund_declined';
  const canSave =
    editReason !== '' &&
    editComment.trim().length > 0 &&
    parsedEditAmount !== null &&
    (!isDeclinedRefund || parsedEditAmount === 0);
  const saveHint = !editReason
    ? 'Выберите причину для сохранения'
    : parsedEditAmount === null
    ? 'Введите неотрицательную целую сумму для сохранения'
    : isDeclinedRefund && parsedEditAmount !== 0
    ? 'При отказе от подарка сумма должна быть равна 0'
    : !editComment.trim()
    ? 'Напишите комментарий для сохранения'
    : '';

  const handleReasonChange = (value: string) => {
    const reason = value as RefundReason;
    setEditReason(reason);
    if (reason === 'refund_declined') {
      setEditAmount('0');
    }
  };

  const handleOpenEdit = (u: User) => {
    const current = getDonation(u.id).totalAmount;
    setEditTarget(u);
    setEditAmount(String(current));
    setEditReason('');
    setEditComment('');
  };

  const handleToggleGift = async (userId: string, sent: boolean) => {
    if (isPreview) return;
    setGiftPendingId(userId);
    try {
      await giftAction.mutate({ userId, sent });
    } catch {
      // error toast handled via onError
    } finally {
      setGiftPendingId(null);
    }
  };

  const handleSave = async () => {
    if (isPreview) return;
    if (!editTarget || !canSave) return;
    const newAmount = parseNonNegativeInt(editAmount);
    if (newAmount === null) return;
    const current = getDonation(editTarget.id).totalAmount;
    try {
      await updateAction.mutate({
        userId: editTarget.id,
        adminEmail: user.email,
        previousAmount: current,
        newAmount,
        reason: editReason,
        comment: editComment.trim(),
      });
    } catch {
      // error rendered via Alert
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Админ-панель
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Управление суммами сборов. Изменение доступно только при указании причины.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              Предпросмотр даты
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Посмотрите доску и блоки именинников на выбранный день. Реальные данные не изменяются.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Popover open={previewOpen} onOpenChange={setPreviewOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {isPreview ? format(today, 'd MMMM yyyy', { locale: ru }) : 'Выбрать дату'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <DayPicker
                  mode="single"
                  selected={previewDate ?? undefined}
                  defaultMonth={previewDate ?? undefined}
                  onSelect={(date) => {
                    if (!date) return;
                    setPreviewDate(date);
                    setPreviewOpen(false);
                  }}
                  classNames={DAY_PICKER_CLASSNAMES}
                  components={{
                    IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                    IconRight: () => <ChevronRight className="h-4 w-4" />,
                  }}
                />
              </PopoverContent>
            </Popover>
            {isPreview && (
              <Button variant="ghost" size="sm" onClick={resetDate} className="gap-1.5">
                <RotateCcw className="h-4 w-4" />
                Сбросить
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={view}
        onValueChange={(v) => setView(v as 'table' | 'history')}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="table">Таблица сборов</TabsTrigger>
          <TabsTrigger value="history">Журнал изменений</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Журнал изменений сумм</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {history.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Изменений пока не было
                </p>
              )}
              {history.map((entry: DonationHistoryEntry) => {
                const target = getUserById(entry.userId);
                return (
                  <div
                    key={entry.id}
                    className="flex flex-col gap-2 rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          {target && <AvatarImage src={target.avatarUrl} alt={target.fullName} />}
                          <AvatarFallback className="text-xs">
                            {target?.fullName[0] || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{target?.fullName || 'Неизвестно'}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(entry.createdAt), 'd MMM yyyy, HH:mm', { locale: ru })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={entry.reason === 'refund_declined' ? 'default' : 'destructive'}>
                        {reasonLabel(entry.reason)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {entry.previousAmount} ₽ → <span className="text-foreground font-medium">{entry.newAmount} ₽</span>
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground italic">
                      «{entry.comment}»
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Админ: {entry.adminEmail}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="table">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Сотрудник</TableHead>
                  <TableHead className="hidden md:table-cell">Отдел</TableHead>
                  <TableHead className="hidden md:table-cell">Дата рождения</TableHead>
                  <TableHead className="text-right">Сумма сбора</TableHead>
                  <TableHead className="text-center">Подарок</TableHead>
                  <TableHead className="text-right">Действие</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.map((u) => {
                  const donation = getDonation(u.id);
                  const declined = isGiftDeclined(u.id, history);
                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={u.avatarUrl} alt={u.fullName} />
                            <AvatarFallback className="text-xs">
                              {u.fullName.split(' ').map((n) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{u.fullName}</p>
                            <p className="hidden text-xs text-muted-foreground truncate sm:block">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-sm md:table-cell">{u.department}</TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                        {format(parseIsoLocal(u.birthDate), 'd MMMM yyyy', { locale: ru })}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {donation.totalAmount.toLocaleString('ru-RU')} ₽
                      </TableCell>
                      <TableCell className="text-center">
                        {declined ? (
                          <Badge variant="secondary" aria-disabled="true">
                            Отказ
                          </Badge>
                        ) : (
                          <Button
                            variant={donation.giftSent ? 'default' : 'outline'}
                            size="sm"
                            aria-pressed={donation.giftSent}
                            aria-label={`Подарок: ${donation.giftSent ? 'выслано' : 'не выслано'}`}
                            onClick={() => handleToggleGift(u.id, !donation.giftSent)}
                            disabled={isPreview || giftPendingId !== null}
                          >
                            {giftPendingId === u.id ? (
                              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                            ) : (
                              <Gift className="h-3.5 w-3.5 sm:hidden" />
                            )}
                            <span className="hidden sm:inline">
                              {donation.giftSent ? 'Выслано' : 'Не выслано'}
                            </span>
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label="Изменить"
                          onClick={() => handleOpenEdit(u)}
                          disabled={isPreview || declined}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          <span className="hidden sm:inline">Изменить</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Изменить сумму сбора</DialogTitle>
            <DialogDescription>
              {editTarget?.fullName} — текущая сумма: {getDonation(editTarget?.id || '').totalAmount.toLocaleString('ru-RU')} ₽
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-amount">Новая сумма (₽)</Label>
              <Input
                id="new-amount"
                type="number"
                min="0"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                disabled={isDeclinedRefund}
              />
              {isDeclinedRefund && (
                <p className="text-xs text-muted-foreground">
                  Отказ от подарка возвращает весь сбор — сумма зафиксирована на 0 ₽.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label>Причина изменения (обязательно)</Label>
              <RadioGroup
                value={editReason}
                onValueChange={handleReasonChange}
              >
                <div className="flex items-start gap-2 rounded-lg border border-border p-3">
                  <RadioGroupItem value="refund_declined" id="r1" className="mt-0.5" />
                  <div>
                    <Label htmlFor="r1" className="text-sm font-medium cursor-pointer">
                      {reasonLabel('refund_declined')}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Именинник не принял поздравление
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg border border-border p-3">
                  <RadioGroupItem value="emergency_refund" id="r2" className="mt-0.5" />
                  <div>
                    <Label htmlFor="r2" className="text-sm font-medium cursor-pointer">
                      {reasonLabel('emergency_refund')}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Средства возвращаются по прямому запросу
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="comment">Комментарий (обязательно)</Label>
              <Textarea
                id="comment"
                placeholder="Опишите причину изменения..."
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                rows={3}
              />
            </div>
            {!canSave && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{saveHint}</AlertDescription>
              </Alert>
            )}
            {updateAction.error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <p>{updateAction.error.message}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={handleSave}
                  >
                    Повторить
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={!canSave || isPreview || updateAction.isLoading}>
              {updateAction.isLoading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : null}
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
