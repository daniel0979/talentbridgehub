import { trpc } from "@/lib/trpc";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Send, Minus, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Message = {
  id: number;
  conversationId: number;
  sender: "admin" | "company";
  body: string;
  read: "unread" | "read";
  createdAt: Date | string;
};

type CompanyInfo = {
  id: number;
  name: string;
  logoUrl: string | null;
};

const POLL_INTERVAL = 3000;

function formatTime(value: Date | string) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AdminChatDialog({
  company,
  open,
  onOpenChange,
  onConversationChanged,
}: {
  company: CompanyInfo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationChanged?: () => void;
}) {
  const utils = trpc.useUtils();
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const openMutation = trpc.admin.messages.open.useMutation({
    onSuccess: (conversation) => {
      setConversationId(conversation.id);
      onConversationChanged?.();
    },
    onError: (err) => toast.error(err.message),
  });

  const messagesQuery = trpc.admin.messages.messages.useQuery(
    { conversationId: conversationId ?? 0 },
    {
      enabled: open && conversationId !== null,
      refetchInterval: POLL_INTERVAL,
    }
  );

  const sendMutation = trpc.admin.messages.send.useMutation({
    onSuccess: async () => {
      setDraft("");
      await utils.admin.messages.messages.invalidate();
      onConversationChanged?.();
    },
    onError: (err) => toast.error(err.message),
  });

  const markReadMutation = trpc.admin.messages.markRead.useMutation({
    onSuccess: async () => {
      await utils.admin.messages.conversations.invalidate();
      onConversationChanged?.();
    },
  });

  // Open (create) the conversation whenever the dialog opens for a company.
  useEffect(() => {
    if (open) {
      setConversationId(null);
      openMutation.mutate({ companyId: company.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, company.id]);

  // Mark company-sent messages as read when new ones arrive.
  useEffect(() => {
    const messages = messagesQuery.data ?? [];
    const hasUnreadCompany = messages.some(
      (m) => m.sender === "company" && m.read === "unread"
    );
    if (conversationId !== null && hasUnreadCompany) {
      markReadMutation.mutate({ conversationId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesQuery.data]);

  // Auto-scroll to the bottom on new messages.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messagesQuery.data]);

  const messages = messagesQuery.data ?? [];
  const loading = openMutation.isPending || messagesQuery.isLoading;

  const handleSend = () => {
    const body = draft.trim();
    if (!body || conversationId === null) return;
    sendMutation.mutate({ conversationId, body });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="border-b px-4 py-3 bg-gradient-to-r from-primary to-accent text-white">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-white/40">
              {company.logoUrl ? (
                <AvatarImage
                  src={company.logoUrl}
                  alt={company.name}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="text-xs font-medium bg-white/20 text-white">
                {(company.name || "?").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <DialogTitle className="text-white text-base truncate">
                {company.name}
              </DialogTitle>
              <DialogDescription className="text-white/80 text-xs">
                Chat with this company
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[420px]" ref={scrollRef}>
          <div className="p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-16">
                No messages yet. Say hello to {company.name}!
              </p>
            ) : (
              messages.map((message) => {
                const isAdmin = message.sender === "admin";
                return (
                  <div
                    key={message.id}
                    className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                        isAdmin
                          ? "bg-gradient-to-r from-primary to-accent text-white rounded-br-sm"
                          : "bg-secondary/70 text-foreground rounded-bl-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.body}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          isAdmin ? "text-white/70" : "text-muted-foreground"
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
            placeholder={`Message ${company.name}...`}
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
      </DialogContent>
    </Dialog>
  );
}
