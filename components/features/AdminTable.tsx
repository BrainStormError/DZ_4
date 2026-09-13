'use client';

import { useState } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Edit, History, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useData } from '@/lib/data-context';
import { mockUsers } from '@/lib/mock-data';
import { reasonLabel } from '@/lib/data-store';
import { parseNonNegativeInt } from '@/lib/utils';
import type { RefundReason, User, DonationHistoryEntry } from '@/lib/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export function AdminTable() {
  const { user } = useAuth();
  const { donations, history, updateDonation } = useData();
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editReason, setEditReason] = useState<RefundReason | ''>('');
  const [editComment, setEditComment] = useState('');
  const [showHistory, setShowHistory] = useState(false);

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
    donations.find((d) => d.userId === userId) || { userId, totalAmount: 0 };

  const parsedEditAmount = parseNonNegativeInt(editAmount);
  const canSave =
    editReason !== '' && editComment.trim().length > 0 && parsedEditAmount !== null;
  const saveHint = !editReason
    ? 'Выберите причину для сохранения'
    : parsedEditAmount === null
    ? 'Введите неотрицательную целую сумму для сохранения'
    : !editComment.trim()
    ? 'Напишите комментарий для сохранения'
    : '';

  const handleOpenEdit = (u: User) => {
    const current = getDonation(u.id).totalAmount;
    setEditTarget(u);
    setEditAmount(String(current));
    setEditReason('');
    setEditComment('');
  };

  const handleSave = () => {
    if (!editTarget || !canSave) return;
    const newAmount = parseNonNegativeInt(editAmount);
    if (newAmount === null) return;
    const current = getDonation(editTarget.id).totalAmount;
    updateDonation({
      userId: editTarget.id,
      adminEmail: user.email,
      previousAmount: current,
      newAmount,
      reason: editReason,
      comment: editComment.trim(),
    });
    setEditTarget(null);
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
        <Button
          variant={showHistory ? 'default' : 'outline'}
          onClick={() => setShowHistory(!showHistory)}
          size="sm"
        >
          <History className="h-4 w-4 mr-1" />
          Журнал изменений
        </Button>
      </div>

      {showHistory ? (
        <Card className="card-shadow">
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
      ) : (
        <Card className="card-shadow overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Сотрудник</TableHead>
                    <TableHead>Отдел</TableHead>
                    <TableHead className="text-right">Сумма сбора</TableHead>
                    <TableHead className="text-right">Действие</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((u) => {
                    const donation = getDonation(u.id);
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
                              <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{u.department}</TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {donation.totalAmount.toLocaleString('ru-RU')} ₽
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(u)}
                          >
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Изменить
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

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
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Причина изменения (обязательно)</Label>
              <RadioGroup
                value={editReason}
                onValueChange={(v) => setEditReason(v as RefundReason)}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={!canSave}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
