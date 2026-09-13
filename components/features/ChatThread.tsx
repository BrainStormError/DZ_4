'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send, Inbox } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useData } from '@/lib/data-context';
import { countUnreadInThread } from '@/lib/data-store';
import { mockUsers } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export function ChatThread() {
  const { user } = useAuth();
  const { getChatThread, getAllThreads, addChatMessage, markThreadRead } = useData();
  const [text, setText] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'admin';
  const employeeUsers = useMemo(() => mockUsers.filter((u) => u.role === 'employee'), []);
  const threads = getAllThreads();
  const activeThreads = threads.filter((t) => t.messages.length > 0).length;

  const activeEmail = isAdmin ? selectedEmail : user?.email ?? null;
  const activeThread = activeEmail ? getChatThread(activeEmail) : null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeThread?.messages.length, activeEmail]);

  if (!user) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEmail || !text.trim()) return;
    addChatMessage(activeEmail, text.trim(), {
      email: user.email,
      isAdmin: user.role === 'admin',
    });
    setText('');
  };

  const renderMessages = () => {
    if (isAdmin && !activeEmail) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center gap-2">
          <Inbox className="h-10 w-10 text-muted-foreground opacity-30" />
          <p className="text-sm text-muted-foreground">Выберите обращение сотрудника</p>
        </div>
      );
    }

    const messages = activeThread?.messages ?? [];

    if (messages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center gap-2">
          <MessageCircle className="h-10 w-10 text-muted-foreground opacity-30" />
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? 'Нет сообщений. Отправьте первое сообщение сотруднику.'
              : 'Нет сообщений. Напишите администратору!'}
          </p>
        </div>
      );
    }

    return messages.map((msg) => {
      const isOwn = msg.authorEmail === user.email;
      const author = mockUsers.find((u) => u.email === msg.authorEmail);
      return (
        <div key={msg.id} className={cn('flex gap-2', isOwn ? 'flex-row-reverse' : 'flex-row')}>
          <Avatar className="h-7 w-7 shrink-0">
            {author && <AvatarImage src={author.avatarUrl} alt={author.fullName} />}
            <AvatarFallback className="text-xs">{msg.authorEmail[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className={cn('flex flex-col gap-1 max-w-[75%]', isOwn ? 'items-end' : 'items-start')}>
            <div
              className={cn(
                'rounded-lg px-3 py-2 text-sm',
                isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
              )}
            >
              {msg.text}
            </div>
            <span className="text-[10px] text-muted-foreground px-1">
              {format(new Date(msg.createdAt), 'd MMM, HH:mm', { locale: ru })}
            </span>
          </div>
        </div>
      );
    });
  };

  return (
    <Card className="card-shadow flex flex-col max-h-[600px]">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          {isAdmin ? 'Все обращения' : 'Чат с администратором'}
        </CardTitle>
        <CardDescription>
          {isAdmin
            ? `Обращения сотрудников и ответы в их ветки. Активных веток: ${activeThreads}`
            : 'Ваша личная ветка переписки с администратором'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <div className={cn('flex h-full', isAdmin ? 'flex-col md:flex-row' : 'flex-col')}>
          {isAdmin && (
            <div className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-border overflow-y-auto max-h-44 md:max-h-none">
              {employeeUsers.map((u) => {
                const thread = getChatThread(u.email);
                const last = thread.messages[thread.messages.length - 1];
                const active = selectedEmail === u.email;
                const unread = countUnreadInThread(thread);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setSelectedEmail(u.email);
                      markThreadRead(u.email);
                    }}
                    className={cn(
                      'flex w-full items-center gap-2 border-b border-border/60 p-3 text-left transition-colors',
                      active ? 'bg-primary/10' : unread > 0 ? 'bg-primary/5 hover:bg-muted' : 'hover:bg-muted'
                    )}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={u.avatarUrl} alt={u.fullName} />
                      <AvatarFallback className="text-xs">
                        {u.fullName[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className={cn('text-sm truncate', unread > 0 ? 'font-semibold' : 'font-medium')}>
                        {u.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {last ? last.text : 'Нет сообщений'}
                      </p>
                    </div>
                    {unread > 0 && (
                      <span
                        className="inline-flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-destructive-foreground"
                        aria-label={`Непрочитанных сообщений: ${unread}`}
                      >
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          <div className="flex flex-1 flex-col overflow-hidden">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {renderMessages()}
            </div>
            <div className="border-t border-border p-3">
              <form onSubmit={handleSend} className="flex gap-2">
                <Textarea
                  placeholder={isAdmin ? 'Ответить сотруднику...' : 'Напишите сообщение...'}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={1}
                  className="min-h-[40px] resize-none"
                  disabled={!activeEmail}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!activeEmail || !text.trim()}
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
