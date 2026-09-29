'use client';

import { useState, useCallback, useEffect } from 'react';
import type {
  Wish,
  Donation,
  DonationHistoryEntry,
  ChatThread,
  ChatMessage,
  RefundReason,
} from './types';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  const data = (await response.json().catch(() => null)) as
    | { error?: string }
    | null;
  if (!response.ok) {
    throw new Error(data?.error || 'Не удалось выполнить запрос');
  }
  return data as T;
}

function upsertDonation(list: Donation[], donation: Donation): Donation[] {
  const exists = list.some((d) => d.userId === donation.userId);
  if (!exists) return [...list, donation];
  return list.map((d) => (d.userId === donation.userId ? donation : d));
}

export function useDataStore() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [history, setHistory] = useState<DonationHistoryEntry[]>([]);
  const [declinedUserIds, setDeclinedUserIds] = useState<string[]>([]);
  const [chats, setChats] = useState<ChatThread[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [loadedWishes, donationPayload, loadedChats] = await Promise.all([
          request<Wish[]>('/api/wishes'),
          request<{
            donations?: Donation[];
            history?: DonationHistoryEntry[];
            declinedUserIds?: string[];
          }>('/api/donations'),
          request<ChatThread[]>('/api/chats'),
        ]);
        if (cancelled) return;
        setWishes(loadedWishes);
        // Administrators receive the amounts and the journal; employees receive
        // only the identifiers of recipients who declined the gift.
        setDonations(donationPayload.donations ?? []);
        setHistory(donationPayload.history ?? []);
        setDeclinedUserIds(donationPayload.declinedUserIds ?? []);
        setChats(loadedChats);
      } catch {
        // Unauthenticated pages and transient failures keep the empty state.
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const addWish = useCallback(async (wish: Omit<Wish, 'id' | 'createdAt'>) => {
    const created = await request<Wish>('/api/wishes', {
      method: 'POST',
      body: JSON.stringify({ targetUserId: wish.targetUserId, text: wish.text }),
    });
    setWishes((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateWish = useCallback(async (id: string, text: string) => {
    const updated = await request<Wish>(`/api/wishes/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ text }),
    });
    setWishes((prev) => prev.map((w) => (w.id === id ? updated : w)));
    return updated;
  }, []);

  const addDonation = useCallback(
    async (userId: string, amount: number, wishText?: string) => {
      const result = await request<{ donation?: Donation; wish: Wish | null }>(
        '/api/donations',
        {
          method: 'POST',
          body: JSON.stringify({ userId, amount, wishText }),
        }
      );
      if (result.donation) {
        const donation = result.donation;
        setDonations((prev) => upsertDonation(prev, donation));
      }
      if (result.wish) {
        const createdWish = result.wish;
        setWishes((prev) => [createdWish, ...prev.filter((w) => w.id !== createdWish.id)]);
      }
      return result.donation;
    },
    []
  );

  const setGiftSent = useCallback(async (userId: string, sent: boolean) => {
    const donation = await request<Donation>(
      `/api/donations/${encodeURIComponent(userId)}/gift-status`,
      { method: 'PATCH', body: JSON.stringify({ sent }) }
    );
    setDonations((prev) => upsertDonation(prev, donation));
    return donation;
  }, []);

  const updateDonation = useCallback(
    async (entry: Omit<DonationHistoryEntry, 'id' | 'createdAt'>) => {
      const result = await request<{
        donation: Donation;
        entry: DonationHistoryEntry;
      }>(`/api/donations/${encodeURIComponent(entry.userId)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          newAmount: entry.newAmount,
          reason: entry.reason,
          comment: entry.comment,
        }),
      });
      setDonations((prev) => upsertDonation(prev, result.donation));
      setHistory((prev) => [result.entry, ...prev]);
      return result.entry;
    },
    []
  );

  const addChatMessage = useCallback(
    async (
      threadUserEmail: string,
      text: string,
      _author: { email: string; isAdmin: boolean }
    ) => {
      const message = await request<ChatMessage>(
        `/api/chats/${encodeURIComponent(threadUserEmail)}/messages`,
        { method: 'POST', body: JSON.stringify({ text }) }
      );
      setChats((prev) => {
        const existing = prev.find((c) => c.userEmail === threadUserEmail);
        if (existing) {
          return prev.map((c) =>
            c.userEmail === threadUserEmail
              ? { ...c, messages: [...c.messages, message] }
              : c
          );
        }
        return [...prev, { userEmail: threadUserEmail, messages: [message] }];
      });
      return message;
    },
    []
  );

  const getAllThreads = useCallback((): ChatThread[] => chats, [chats]);

  const markThreadRead = useCallback(async (userEmail: string) => {
    try {
      const thread = await request<ChatThread>(
        `/api/chats/${encodeURIComponent(userEmail)}/read`,
        { method: 'POST' }
      );
      setChats((prev) => prev.map((c) => (c.userEmail === userEmail ? thread : c)));
    } catch {
      // The unread marker is best-effort; it stays until the request succeeds.
    }
  }, []);

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
    declinedUserIds,
    chats,
    addWish,
    updateWish,
    addDonation,
    setGiftSent,
    updateDonation,
    addChatMessage,
    getChatThread,
    getAllThreads,
    markThreadRead,
  };
}

export type DataStore = ReturnType<typeof useDataStore>;

export function isGiftDeclined(
  userId: string,
  history: DonationHistoryEntry[]
): boolean {
  return history.some(
    (entry) => entry.userId === userId && entry.reason === 'refund_declined'
  );
}

export function countUnreadInThread(thread: ChatThread): number {
  return thread.messages.filter(
    (message) => !message.isAdmin && message.readByAdmin !== true
  ).length;
}

export function countUnreadMessages(threads: ChatThread[]): number {
  return threads.reduce((sum, thread) => sum + countUnreadInThread(thread), 0);
}

export function reasonLabel(reason: RefundReason): string {
  return reason === 'refund_declined'
    ? 'Возврат (отказ от подарка)'
    : 'Экстренный возврат';
}
