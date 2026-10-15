"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";

// The socket server is the same host as the API, minus the /api/v1 suffix.
const SOCKET_URL = (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1")
  .replace(/\/api\/v1\/?$/, "")
  .replace(/\/+$/, "");

let sharedSocket: Socket | null = null;
const subscriptions = new WeakMap<Socket, number>();

export function createAuthenticatedSocket(token: string, url = SOCKET_URL) {
  if (!token) throw new Error("An authenticated session is required for realtime updates.");
  return io(url, {
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: false,
    reconnection: true,
  });
}

const getSocket = (token: string) => {
  if (sharedSocket && (sharedSocket.auth as { token?: string }).token !== token) {
    sharedSocket.disconnect();
    sharedSocket = null;
  }
  if (sharedSocket && sharedSocket.connected) return sharedSocket;
  if (sharedSocket) return sharedSocket;
  sharedSocket = createAuthenticatedSocket(token);
  return sharedSocket;
};

const subscribe = (token: string) => {
  const socket = getSocket(token);
  subscriptions.set(socket, (subscriptions.get(socket) ?? 0) + 1);
  socket.connect();
  return { socket, release: () => {
    const remaining = (subscriptions.get(socket) ?? 1) - 1;
    subscriptions.set(socket, remaining);
    if (remaining === 0) {
      socket.disconnect();
      if (sharedSocket === socket) sharedSocket = null;
    }
  } };
};

type InboxPayload = Record<string, unknown>;

type InboxHandlers = {
  onNewMessage?: (payload: InboxPayload) => void;
  onMessageRead?: (payload: InboxPayload) => void;
  onNewConversation?: (payload: InboxPayload) => void;
};

/**
 * Joins the current user's room and the active chat room (if provided),
 * and wires up real-time inbox events.
 */
export function useInboxSocket(activeChatId: string | null, handlers: InboxHandlers) {
  const { data: session } = useSession();
  const userId = session?.user?._id;
  const token = session?.accessToken;
  const handlersRef = useRef(handlers);

  // Always read latest handler refs without re-binding listeners.
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  // Join user room when we know who we are.
  useEffect(() => {
    if (!userId || !token) return;
    const { socket, release } = subscribe(token);
    const join = () => socket.emit("join-user-room", { _id: userId });
    if (socket.connected) join();
    socket.on("connect", join);

    const onNewMessage = (payload: InboxPayload) => handlersRef.current.onNewMessage?.(payload);
    const onMessageRead = (payload: InboxPayload) => handlersRef.current.onMessageRead?.(payload);
    const onNewConversation = (payload: InboxPayload) =>
      handlersRef.current.onNewConversation?.(payload);

    socket.on("inbox:new-message", onNewMessage);
    socket.on("inbox:read", onMessageRead);
    socket.on("inbox:new-conversation", onNewConversation);

    return () => {
      socket.off("connect", join);
      socket.off("inbox:new-message", onNewMessage);
      socket.off("inbox:read", onMessageRead);
      socket.off("inbox:new-conversation", onNewConversation);
      release();
    };
  }, [userId, token]);

  // Join chat room when a conversation is selected.
  useEffect(() => {
    if (!activeChatId || !userId || !token) return;
    const socket = getSocket(token);
    const join = () => socket.emit("join-chat", { _id: activeChatId });
    if (socket.connected) join();
    socket.on("connect", join);
    return () => {
      socket.emit("leave-chat", activeChatId);
      socket.off("connect", join);
    };
  }, [activeChatId, userId, token]);
}

/**
 * Generic socket listener that joins the user room and subscribes to a single
 * event. Used by NotificationBell and other one-off realtime widgets.
 */
export function useSocketEvent<T = unknown>(event: string, handler: (payload: T) => void) {
  const { data: session } = useSession();
  const userId = session?.user?._id;
  const token = session?.accessToken;
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!userId || !token) return;
    const { socket, release } = subscribe(token);
    const join = () => socket.emit("join-user-room", { _id: userId });
    if (socket.connected) join();
    socket.on("connect", join);
    const wrapped = (payload: T) => handlerRef.current(payload);
    socket.on(event, wrapped);
    return () => {
      socket.off("connect", join);
      socket.off(event, wrapped);
      release();
    };
  }, [userId, token, event]);
}
