'use client';

import { useState, useCallback } from 'react';
import type { Wish, Donation, DonationHistoryEntry, ChatThread, ChatMessage, RefundReason } from './types';
import {
  mockWishes,
  mockDonations,
  mockDonationHistory,
  mockChats,
} from './mock-data';

export function useDataStore() {
  const [wishes, setWishes] = useState<Wish[]>(mockWishes);
  const [donations, setDonations] = useState<Donation[]>(mockDonations);
  const [history, setHistory] = useState<DonationHistoryEntry[]>(mockDonationHistory);
  const [chats, setChats] = useState<ChatThread[]>(mockChats);

  const addWish = useCallback((wish: Omit<Wish, 'id' | 'createdAt'>) => {
    const newWish: Wish = {
      ...wish,
      id: `w${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setWishes((prev) => [newWish, ...prev]);
    return newWish;
  }, []);

  const addDonation = useCallback((userId: string, amount: number) => {
    setDonations((prev) =>
      prev.map((d) =>
        d.userId === userId ? { ...d, totalAmount: d.totalAmount + amount } : d
      )
    );
  }, []);

  const updateDonation = useCallback(
    (entry: Omit<DonationHistoryEntry, 'id' | 'createdAt'>) => {
      setDonations((prev) =>
        prev.map((d) =>
          d.userId === entry.userId ? { ...d, totalAmount: entry.newAmount } : d
        )
      );
      const newEntry: DonationHistoryEntry = {
        ...entry,
        id: `h${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setHistory((prev) => [newEntry, ...prev]);
      return newEntry;
    },
    []
  );

  const addChatMessage = useCallback(
    (
      threadUserEmail: string,
      text: string,
      author: { email: string; isAdmin: boolean }
    ) => {
      const newMsg: ChatMessage = {
        id: `c${Date.now()}`,
        authorEmail: author.email,
        text,
        isAdmin: author.isAdmin,
        createdAt: new Date().toISOString(),
      };
      setChats((prev) => {
        const existing = prev.find((c) => c.userEmail === threadUserEmail);
        if (existing) {
          return prev.map((c) =>
            c.userEmail === threadUserEmail ? { ...c, messages: [...c.messages, newMsg] } : c
          );
        }
        return [...prev, { userEmail: threadUserEmail, messages: [newMsg] }];
      });
      return newMsg;
    },
    []
  );

  const getAllThreads = useCallback((): ChatThread[] => chats, [chats]);

  const getChatThread = useCallback(
    (userEmail: string): ChatThread => {
      return (
        chats.find((c) => c.userEmail === userEmail) || {
          userEmail,
          messages: [],
        }
      );
    },
    [chats]
  );

  return {
    wishes,
    donations,
    history,
    chats,
    addWish,
    addDonation,
    updateDonation,
    addChatMessage,
    getChatThread,
    getAllThreads,
  };
}

export type DataStore = ReturnType<typeof useDataStore>;

export function reasonLabel(reason: RefundReason): string {
  return reason === 'refund_declined'
    ? 'Возврат (отказ от подарка)'
    : 'Экстренный возврат';
}
