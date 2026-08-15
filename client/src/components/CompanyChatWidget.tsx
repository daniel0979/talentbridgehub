import { trpc } from "@/lib/trpc";
import { useCompanyAuth } from "@/_core/hooks/useCompanyAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const POLL_INTERVAL = 3000;

type Message = {
  id: number;
  conversationId: number;
  sender: "admin" | "company";
  body: string;
  read: "unread" | "read";
  createdAt: Date | string;
};

function formatTime(value: Date | string) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Floating chat widget for the company (client) dashboard. Lets a company
 * message the admin support team. Polls for new messages every ~3s.
 */
export function CompanyChatWidget() {
  const { company } = useCompanyAuth();
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversationQuery = trpc.company.messages.conversation.useQuery(undefined, {
    enabled: !!company,
    refetchInterval: POLL_INTERVAL,
  });
  const hasUnread = (conversationQuery.data?.unread ?? 0) > 0;

  const openMutation = trpc.company.messages.open.useMutation({
    onSuccess: (conversation) => {
      setConversationId(conversation.id);
    },
    onError: (err) => toast.error(err.message),
  });

  const messagesQuery = trpc.company.messages.messages.useQuery(
    { conversationId: conversationId ?? 0 },
    {
      enabled: open && conversationId !== null && !!company,
      refetchInterval: POLL_INTERVAL,
    }
  );

  const sendMutation = trpc.company.messages.send.useMutation({
    onSuccess: async () => {
      setDraft("");
      await utils.company.messages.messages.invalidate();
      await utils.company.messages.conversation.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const markReadMutation = trpc.company.messages.markRead.useMutation({
    onSuccess: async () => {
      await utils.company.messages.conversation.invalidate();
    },
  });

  // Open/create the conversation when the widget is opened.
  useEffect(() => {
    if (open && !conversationId) {
      openMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Mark admin-sent messages as read when the widget is open.
  useEffect(() => {
    const messages = messagesQuery.data ?? [];
    const hasUnreadAdmin = messages.some(
      (m) => m.sender === "admin" && m.read === "unread"
    );
    if (conversationId !== null && hasUnreadAdmin) {
      markReadMutation.mutate({ conversationId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesQuery.data]);

  // Auto-scroll to bottom on new messages.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messagesQuery.data]);

  const messages = messagesQuery.data ?? [];
  const loading = openMutation.isPending || (open && messagesQuery.isLoading);

  const handleSend = () => {
    const body = draft.trim();
    if (!body || conversationId === null) return;
    sendMutation.mutate({ conversationId, body });
  };

  if (!company) return null;

  return (
    <>
      {/* Floating launcher button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white font-semibold px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
      >
        {open ? (
          <X className="w-5 h-5" />
        ) : (
          <MessageSquare className="w-5 h-5" />
        )}
        {!open && <span className="hidden sm:inline">Support</span>}
        {hasUnread && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
            {conversationQuery.data?.unread ?? 0}
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-secondary/30 bg-background shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary to-accent text-white">
            <Avatar className="h-8 w-8 border border-white/40">
              <AvatarFallback className="text-xs font-medium bg-white/20 text-white">
                A
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">
                TalentBridge Admin Support
              </p>
              <p className="text-[11px] text-white/80">Typically replies in minutes</p>
            </div>
          </div>

          <ScrollArea className="h-80" ref={scrollRef}>
            <div className="p-4 space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-16">
                  No messages yet. Send a message to the admin team!
                </p>
              ) : (
                messages.map((message) => {
                  const isCompany = message.sender === "company";
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isCompany ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                          isCompany
                            ? "bg-gradient-to-r from-primary to-accent text-white rounded-br-sm"
                            : "bg-secondary/70 text-foreground rounded-bl-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.body}</p>
                        <p
                          className={`text-[10px] mt-1 ${
                            isCompany ? "text-white/70" : "text-muted-foreground"
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          <div className="border-t p-3 flex items-center gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message..."
              className="flex-1"
              disabled={conversationId === null}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={conversationId === null || !draft.trim() || sendMutation.isPending}
              className="bg-gradient-to-r from-primary to-accent text-white shrink-0"
            >
              {sendMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
