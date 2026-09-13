'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatThread } from '@/components/features/ChatThread';
import { HelpCircle, Mail, ShieldCheck, EyeOff, Gift, Users } from 'lucide-react';

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
    answer: 'Автор пожелания отображается под корпоративным ником — это часть вашей корпоративной почты (до символа @). Например, anna.smirnova@company.com будет показана как anna.smirnova.',
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

export default function FAQPage() {
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

      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="faq">Вопросы и ответы</TabsTrigger>
          <TabsTrigger value="chat">Написать админу</TabsTrigger>
        </TabsList>

        <TabsContent value="faq">
          <div className="flex flex-col gap-4">
            {/* Quick info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
              <Card className="card-shadow">
                <CardContent className="p-4 flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-xs font-medium">Добровольное участие</p>
                </CardContent>
              </Card>
              <Card className="card-shadow">
                <CardContent className="p-4 flex items-center gap-3">
                  <EyeOff className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-xs font-medium">Суммы скрыты от сотрудников</p>
                </CardContent>
              </Card>
              <Card className="card-shadow">
                <CardContent className="p-4 flex items-center gap-3">
                  <Gift className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-xs font-medium">Подарок = внимание, а не сумма</p>
                </CardContent>
              </Card>
            </div>

            <Card className="card-shadow">
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
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Написать администратору
                </CardTitle>
                <CardDescription>
                  Ваша личная ветка переписки. Видите только свои сообщения.
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
