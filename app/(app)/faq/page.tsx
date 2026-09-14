'use client';

import { Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatThread } from '@/components/features/ChatThread';
import { HelpCircle, Mail } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useData } from '@/lib/data-context';
import { countUnreadMessages } from '@/lib/data-store';

const FAQ_ITEMS = [
  {
    id: 'q1',
    question: 'Обязательно ли участвовать в сборе?',
    answer: 'Нет, участие полностью добровольное. Вы можете поздравить коллегу только пожеланием на доске, без отправки средств. Никакого давления — только тёплое внимание.',
  },
  {
    id: 'q2',
    question: 'Кто видит суммы сборов?',
    answer: 'Суммы сборов видит только администратор. Обычные сотрудники не видят ни свои, ни чужие суммы. Это сделано намеренно, чтобы не создавать неловких ситуаций.',
  },
  {
    id: 'q3',
    question: 'Может ли администратор изменить сумму сбора?',
    answer: 'Администратор может изменить сумму только в двух случаях: возврат из-за отказа поздравляемого от подарка, либо экстренный возврат по прямому запросу. В обоих случаях администратор обязан указать причину и оставить комментарий.',
  },
  {
    id: 'q4',
    question: 'Как автор отображается на доске пожеланий?',
    answer: 'Автор пожелания отображается настоящим именем, а в скобках указывается корпоративный ник — часть адреса до символа @. Формат: Фамилия Имя (ник), например: Смирнова Анна (anna.smirnova). Полный адрес почты при этом не раскрывается.',
  },
  {
    id: 'q5',
    question: 'Как войти в систему?',
    answer: 'Вход осуществляется по корпоративной почте @company.com. Просто введите свой адрес в форме входа — отдельная регистрация не нужна.',
  },
  {
    id: 'q6',
    question: 'Что если именинник отказался от подарка?',
    answer: 'Если сотрудник отказался от подарка, администратор оформляет возврат средств с указанием причины «Возврат (отказ от подарка)». Все изменения фиксируются в журнале.',
  },
];

function FAQContent() {
  const { user } = useAuth();
  const { chats } = useData();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tab = searchParams.get('tab') === 'messages' ? 'chat' : 'faq';

  const isAdmin = user?.role === 'admin';
  const unreadCount = isAdmin ? countUnreadMessages(chats) : 0;

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'chat') {
      params.set('tab', 'messages');
    } else {
      params.delete('tab');
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-primary" />
          Частые вопросы
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ответы на популярные вопросы о сборе средств на подарки
        </p>
      </div>

      <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="faq">Вопросы и ответы</TabsTrigger>
          <TabsTrigger value="chat" className="gap-1.5">
            {isAdmin ? 'Сообщения' : 'Написать админу'}
            {unreadCount > 0 && (
              <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-destructive-foreground">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faq">
          <div className="flex flex-col gap-4">
            <Card>
              <CardContent className="p-4">
                <Accordion type="single" collapsible className="w-full">
                  {FAQ_ITEMS.map((item) => (
                    <AccordionItem key={item.id} value={item.id}>
                      <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="chat">
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  {isAdmin ? 'Сообщения' : 'Написать администратору'}
                </CardTitle>
                <CardDescription>
                  {isAdmin
                    ? 'Обращения сотрудников и ответы в их ветки.'
                    : 'Ваша личная ветка переписки. Видите только свои сообщения.'}
                </CardDescription>
              </CardHeader>
            </Card>
            <ChatThread />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function FAQPage() {
  return (
    <Suspense
      fallback={
        <div
          className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 min-h-[60vh]"
          aria-busy="true"
        />
      }
    >
      <FAQContent />
    </Suspense>
  );
}
