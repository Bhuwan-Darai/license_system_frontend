"use client";

import api from "@/app/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type Channel = "WHATSAPP" | "FACEBOOK";

export interface Conversation {
  conversation_id: string;
  channel: Channel;
  external_id: string;
  contact_name: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export interface ChatMessage {
  message_id: string;
  direction: "IN" | "OUT";
  body: string;
  status: "RECEIVED" | "SENT" | "FAILED";
  created_at: string;
}

export interface ChatStatus {
  whatsapp: boolean;
  facebook: boolean;
  webhook: boolean;
}

// The inbox has no websocket, so the lists refresh on a short timer.
const LIST_REFRESH_MS = 5000;
const THREAD_REFRESH_MS = 3000;

export const useChatStatus = () =>
  useQuery({
    queryKey: ["chat-status"],
    queryFn: async () => (await api.get("/chat/status")).data.data as ChatStatus,
  });

export const useConversations = (channel: Channel, search: string) =>
  useQuery({
    queryKey: ["chat-conversations", channel, search],
    queryFn: async () => {
      const res = await api.get("/chat/conversations", {
        params: { channel, search: search || undefined },
      });
      return (res.data.data ?? []) as Conversation[];
    },
    refetchInterval: LIST_REFRESH_MS,
  });

export const useThread = (conversationId: string | null) =>
  useQuery({
    queryKey: ["chat-thread", conversationId],
    enabled: !!conversationId,
    queryFn: async () => {
      const res = await api.get(`/chat/conversations/${conversationId}/messages`);
      return res.data.data as { conversation: Conversation; messages: ChatMessage[] };
    },
    refetchInterval: THREAD_REFRESH_MS,
  });

export const useChatMutations = () => {
  const queryClient = useQueryClient();
  const refresh = (conversationId?: string) => {
    queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
    if (conversationId) {
      queryClient.invalidateQueries({ queryKey: ["chat-thread", conversationId] });
    }
  };

  const send = useMutation({
    mutationFn: ({ conversationId, body }: { conversationId: string; body: string }) =>
      api.post(`/chat/conversations/${conversationId}/messages`, { body }),
    // a FAILED message is stored too, so refresh on error as well
    onSettled: (_d, _e, vars) => refresh(vars.conversationId),
  });

  const start = useMutation({
    mutationFn: (payload: { channel: Channel; external_id: string; body: string }) =>
      api.post("/chat/conversations", payload),
    onSettled: () => refresh(),
  });

  return {
    sendMessage: send.mutateAsync,
    isSending: send.isPending,
    startChat: start.mutateAsync,
    isStarting: start.isPending,
  };
};
