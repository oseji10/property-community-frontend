// app/dashboard/messages/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import api from "@/app/lib/api";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { debounce } from "lodash";
import { useRouter } from "next/navigation";
import { useUnreadStore } from "@/app/lib/stores/unreadStore";

interface Message {
  id: number;
  sender: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  property?: {
    propertyId: number;
    propertyTitle: string;
    slug: string;
  };
  content: string;
  created_at: string;
  isRead: boolean;
}

export default function MessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read">("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [filterLoading, setFilterLoading] = useState(false);

  // Local unread count for instant navbar sync
  const [localUnreadCount, setLocalUnreadCount] = useState<number>(0);
  const { unreadCount, setUnreadCount, decrementUnread, resetUnread } = useUnreadStore();
  // Debounced fetch
  const debouncedFetch = useCallback(
    debounce(() => fetchMessages(), 500),
    [search, statusFilter, startDate, endDate]
  );

  useEffect(() => {
    debouncedFetch();
    return () => debouncedFetch.cancel();
  }, [debouncedFetch]);

  const fetchMessages = async () => {
    try {
      setFilterLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const res = await api.get(`/messages/inbox?${params.toString()}`);
      const newMessages = res.data.data || [];
      setMessages(newMessages);

      // Update local unread count
    //   const unread = newMessages.filter((m: Message) => !m.isRead).length;
    //   setLocalUnreadCount(unread);
    const unread = newMessages.filter((m: Message) => !m.isRead).length;
    setUnreadCount(unread);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load messages");
      toast.error("Could not load your messages");
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  };

  const markAsRead = async (messageId: number) => {
  // Optimistic UI + instant navbar sync
  setMessages((prev) =>
    prev.map((msg) =>
      msg.id === messageId ? { ...msg, isRead: true } : msg
    )
  );
  decrementUnread(); // ← instant navbar update

  try {
    await api.patch(`/messages/${messageId}/read`);
    toast.success("Marked as read");
    router.refresh();
  } catch (err: any) {
    // Rollback
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isRead: false } : msg
      )
    );
    setUnreadCount((prev) => prev + 1);
    toast.error("Failed to mark as read");
  }
};

  const markAllAsRead = async () => {
  const unreadIds = messages.filter((m) => !m.isRead).map((m) => m.id);
  if (unreadIds.length === 0) return toast("All messages are already read");

  // Optimistic: reset count & mark all
  resetUnread();
  setMessages((prev) => prev.map((msg) => ({ ...msg, isRead: true })));

  try {
    await Promise.all(unreadIds.map((id) => api.patch(`/messages/${id}/read`)));
    toast.success(`Marked ${unreadIds.length} message(s) as read`);
    router.refresh();
  } catch (err: any) {
    fetchMessages(); // rollback by reload
    toast.error("Failed to mark messages as read");
  }
};

  const sendReply = async (messageId: number) => {
    if (!replyText.trim()) return;

    setSendingReply(true);

    try {
      await api.post(`/messages/${messageId}/reply`, {
        content: replyText.trim(),
      });

      toast.success("Reply sent!");
      setReplyText("");
      setReplyingTo(null);
      fetchMessages();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300">
          Loading your messages...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <p className="text-xl text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={fetchMessages}
          className="px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="container max-w-6xl mx-auto px-5">
        {/* Header + Filters */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-6">
            <h1 className="text-4xl font-bold text-dark dark:text-white">
              Messages
            </h1>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {messages.length} message{messages.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col gap-6 bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Search + Status + Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative col-span-full sm:col-auto">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                  Enter Text
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by sender or content..."
                  className="w-full pl-4 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                  Filter by status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Messages</option>
                  <option value="unread">Unread Only</option>
                  <option value="read">Read Only</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                  From
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                  To
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 justify-end">
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setStartDate("");
                  setEndDate("");
                }}
                className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition text-sm font-medium"
              >
                Clear Filters
              </button>

              <button
                onClick={fetchMessages}
                disabled={filterLoading}
                className={`
                  px-6 py-2.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition flex items-center gap-2 text-sm font-medium
                  ${filterLoading ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <Icon icon="solar:refresh-linear" width={18} />
                Refresh
              </button>

              {messages.some((m) => !m.isRead) && (
                <button
                  onClick={markAllAsRead}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm font-medium"
                >
                  Mark All as Read
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Messages list */}
        {messages.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <Icon
              icon="solar:chat-round-line-duotone"
              width={80}
              height={80}
              className="mx-auto text-gray-300 dark:text-gray-600 mb-6"
            />
            <h2 className="text-2xl font-semibold mb-3">No messages yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              When someone contacts you about your properties, their messages will appear here.
            </p>
            <Link
              href="/dashboard/properties"
              className="inline-block px-8 py-3 bg-primary text-white rounded-full hover:bg-primary/90"
            >
              View Your Properties
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`
                  bg-white dark:bg-gray-800 rounded-2xl shadow-md border
                  ${msg.isRead 
                    ? "border-gray-200 dark:border-gray-700" 
                    : "border-primary/30 bg-primary/5 dark:bg-primary/10"}
                  overflow-hidden transition-all hover:shadow-lg
                `}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {msg.sender.firstName} {msg.sender.lastName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {msg.sender.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}</span>
                      {!msg.isRead && (
                        <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          New
                        </span>
                      )}
                    </div>
                  </div>

                  {msg.property && (
                    <Link
                      href={`/properties/detail?slug=${msg.property.slug}`}
                      className="inline-block mb-4 text-primary hover:underline text-sm"
                    >
                      Regarding: {msg.property.propertyTitle}
                    </Link>
                  )}

                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line mb-6">
                    {msg.content}
                  </p>

                  <div className="flex flex-wrap gap-4">
                    {replyingTo === msg.id ? (
                      <div className="w-full space-y-4">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your reply..."
                          rows={4}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        />

                        <div className="flex gap-4">
                          <button
                            onClick={() => sendReply(msg.id)}
                            disabled={sendingReply || !replyText.trim()}
                            className={`
                              px-6 py-2.5 rounded-full font-medium text-white
                              ${sendingReply || !replyText.trim()
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-primary hover:bg-primary/90"}
                            `}
                          >
                            {sendingReply ? "Sending..." : "Send Reply"}
                          </button>

                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText("");
                            }}
                            className="px-6 py-2.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-4">
                        <button
                          onClick={() => {
                            setReplyingTo(msg.id);
                            if (!msg.isRead) markAsRead(msg.id);
                          }}
                          className="px-6 py-2.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary font-medium transition"
                        >
                          Reply
                        </button>

                        {!msg.isRead && (
                          <button
                            onClick={() => markAsRead(msg.id)}
                            className="px-6 py-2.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium transition"
                          >
                            Mark as Read
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}