'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useDataStore, type DataStore } from './data-store';

export type WishesValue = Pick<DataStore, 'wishes' | 'addWish' | 'updateWish'>;
export type DonationsValue = Pick<
  DataStore,
  'donations' | 'history' | 'addDonation' | 'setGiftSent' | 'updateDonation'
>;
export type ChatsValue = Pick<
  DataStore,
  'chats' | 'addChatMessage' | 'getChatThread' | 'getAllThreads' | 'markThreadRead'
>;

const WishesContext = createContext<WishesValue | undefined>(undefined);
const DonationsContext = createContext<DonationsValue | undefined>(undefined);
const ChatsContext = createContext<ChatsValue | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const store = useDataStore();

  const wishesValue = useMemo<WishesValue>(
    () => ({
      wishes: store.wishes,
      addWish: store.addWish,
      updateWish: store.updateWish,
    }),
    [store.wishes, store.addWish, store.updateWish]
  );

  const donationsValue = useMemo<DonationsValue>(
    () => ({
      donations: store.donations,
      history: store.history,
      addDonation: store.addDonation,
      setGiftSent: store.setGiftSent,
      updateDonation: store.updateDonation,
    }),
    [
      store.donations,
      store.history,
      store.addDonation,
      store.setGiftSent,
      store.updateDonation,
    ]
  );

  const chatsValue = useMemo<ChatsValue>(
    () => ({
      chats: store.chats,
      addChatMessage: store.addChatMessage,
      getChatThread: store.getChatThread,
      getAllThreads: store.getAllThreads,
      markThreadRead: store.markThreadRead,
    }),
    [
      store.chats,
      store.addChatMessage,
      store.getChatThread,
      store.getAllThreads,
      store.markThreadRead,
    ]
  );

  return (
    <WishesContext.Provider value={wishesValue}>
      <DonationsContext.Provider value={donationsValue}>
        <ChatsContext.Provider value={chatsValue}>{children}</ChatsContext.Provider>
      </DonationsContext.Provider>
    </WishesContext.Provider>
  );
}

export function useWishes() {
  const ctx = useContext(WishesContext);
  if (!ctx) throw new Error('useWishes must be used within DataProvider');
  return ctx;
}

export function useDonations() {
  const ctx = useContext(DonationsContext);
  if (!ctx) throw new Error('useDonations must be used within DataProvider');
  return ctx;
}

export function useChats() {
  const ctx = useContext(ChatsContext);
  if (!ctx) throw new Error('useChats must be used within DataProvider');
  return ctx;
}
