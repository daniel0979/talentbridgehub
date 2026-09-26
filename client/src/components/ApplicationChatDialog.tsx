import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type ChatMessage = {
  id: number;
  senderRole: "company" | "job_seeker";
  body: string;
  read: "unread" | "read";
  createdAt: Date | string;
};

function formatMessageTime(value: Date | string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function ChatMessages({
  messages,
  viewerRole,
  loading,
}: {
  messages: ChatMessage[];
  viewerRole: "company" | "job_seeker";
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }
  if (messages.length === 0) {
    return (
      <div className="flex h-72 flex-col items-center justify-center text-center text-sm text-muted-foreground">
        <MessageCircle className="mb-3 h-8 w-8 text-primary/60" />
        <p>No messages yet.</p>
        <p>Start the conversation with a professional introduction.</p>
      </div>
    );
  }
  return (
    <ScrollArea className="h-72 pr-3">
      <div className="space-y-3 py-2">
        {messages.map((message) => {
          const mine = message.senderRole === viewerRole;
          return (
            <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                  mine
                    ? "rounded-br-sm bg-gradient-to-r from-primary to-accent text-white"
                    : "rounded-bl-sm bg-secondary/70 text-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.body}</p>
                <p className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-muted-foreground"}`}>
                  {formatMessageTime(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

function ChatComposer({
  draft,
  setDraft,
  onSend,
  pending,
}: {
  draft: string;
  setDraft: (value: string) => void;
  onSend: () => void;
  pending: boolean;
}) {
  return (
    <div className="flex items-center gap-2 border-t pt-3">
      <Input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSend();
          }
        }}
        placeholder="Write a message..."
        maxLength={5000}
        disabled={pending}
        aria-label="Message"
      />
      <Button
        type="button"
        size="icon"
        onClick={onSend}
        disabled={!draft.trim() || pending}
        className="shrink-0 bg-gradient-to-r from-primary to-accent text-white"
        aria-label="Send message"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </Button>
    </div>
  );
}

export function CompanyApplicationChat({
  applicationId,
  seekerName,
  jobTitle,
}: {
  applicationId: number;
  seekerName: string;
  jobTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState("");
  const utils = trpc.useUtils();
  const openMutation = trpc.company.applications.chat.open.useMutation({
    onSuccess: () => setReady(true),
    onError: (error) => {
      setOpen(false);
      toast.error(error.message || "Could not open the conversation.");
    },
  });
  const messagesQuery = trpc.company.applications.chat.messages.useQuery(
    { applicationId },
    { enabled: open && ready, refetchInterval: open && ready ? 5000 : false }
  );
  const markReadMutation = trpc.company.applications.chat.markRead.useMutation();
  const sendMutation = trpc.company.applications.chat.send.useMutation({
    onSuccess: async () => {
      setDraft("");
      await utils.company.applications.chat.messages.invalidate({ applicationId });
      await utils.company.applications.forCompany.invalidate();
    },
    onError: (error) => toast.error(error.message || "Could not send the message."),
  });

  useEffect(() => {
    if (open && !ready) {
      openMutation.mutate({ applicationId });
    }
  }, [applicationId, open, ready]);

  useEffect(() => {
    if (open && ready && messagesQuery.data?.some((message) => message.senderRole === "job_seeker")) {
      markReadMutation.mutate({ applicationId });
    }
  }, [applicationId, messagesQuery.data, open, ready]);

  const handleSend = () => {
    const body = draft.trim();
    if (!body || !ready || sendMutation.isPending) return;
    sendMutation.mutate({ applicationId, body });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setReady(false);
          setDraft("");
        }
      }}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="border-primary/30 text-primary hover:bg-primary/5"
      >
        <MessageCircle className="mr-1.5 h-4 w-4" />
        Message candidate
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Message {seekerName}</DialogTitle>
          <DialogDescription>Private conversation about the application for {jobTitle}.</DialogDescription>
        </DialogHeader>
        <ChatMessages
          messages={(messagesQuery.data ?? []) as ChatMessage[]}
          viewerRole="company"
          loading={openMutation.isPending || (ready && messagesQuery.isLoading)}
        />
        <ChatComposer
          draft={draft}
          setDraft={setDraft}
          onSend={handleSend}
          pending={sendMutation.isPending || !ready}
        />
      </DialogContent>
    </Dialog>
  );
}

export function JobSeekerApplicationChat({
  applicationId,
  companyName,
  jobTitle,
}: {
  applicationId: number;
  companyName: string;
  jobTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const utils = trpc.useUtils();
  const messagesQuery = trpc.jobSeeker.applications.chat.messages.useQuery(
    { applicationId },
    { enabled: open, refetchInterval: open ? 5000 : false }
  );
  const markReadMutation = trpc.jobSeeker.applications.chat.markRead.useMutation();
  const sendMutation = trpc.jobSeeker.applications.chat.send.useMutation({
    onSuccess: async () => {
      setDraft("");
      await utils.jobSeeker.applications.chat.messages.invalidate({ applicationId });
      await utils.jobSeeker.applications.chat.list.invalidate();
    },
    onError: (error) => toast.error(error.message || "Could not send the message."),
  });

  useEffect(() => {
    if (open && messagesQuery.data?.some((message) => message.senderRole === "company")) {
      markReadMutation.mutate({ applicationId });
      void utils.jobSeeker.applications.chat.list.invalidate();
    }
  }, [applicationId, messagesQuery.data, open]);

  const handleSend = () => {
    const body = draft.trim();
    if (!body || sendMutation.isPending) return;
    sendMutation.mutate({ applicationId, body });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="border-primary/30 text-primary hover:bg-primary/5"
      >
        <MessageCircle className="mr-1.5 h-4 w-4" />
        Message company
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Message {companyName}</DialogTitle>
          <DialogDescription>Private conversation about your application for {jobTitle}.</DialogDescription>
        </DialogHeader>
        <ChatMessages
          messages={(messagesQuery.data ?? []) as ChatMessage[]}
          viewerRole="job_seeker"
          loading={messagesQuery.isLoading}
        />
        <ChatComposer
          draft={draft}
          setDraft={setDraft}
          onSend={handleSend}
          pending={sendMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
