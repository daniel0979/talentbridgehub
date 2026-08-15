import { useJobSeekerAuth } from "@/_core/hooks/useJobSeekerAuth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  UploadCloud,
  X,
  Send,
  Loader2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type ApplyJobDialogProps = {
  jobId: number;
  jobTitle: string;
  companyName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Read a resume/CV file and convert it to a base64 data URL (limited size).
 * Returns the data URL, or null if the file is too large.
 */
function readResumeFile(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    if (file.size > 5 * 1024 * 1024) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => resolve(null);
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

export default function ApplyJobDialog({
  jobId,
  jobTitle,
  companyName,
  open,
  onOpenChange,
}: ApplyJobDialogProps) {
  const { jobSeeker } = useJobSeekerAuth();
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");

  // Prefill the resume from the job seeker's saved profile when available.
  useEffect(() => {
    if (open) {
      setCoverLetter("");
      setError("");
      setUploadError("");
      if (jobSeeker?.resumeUrl) {
        setResumeUrl(jobSeeker.resumeUrl);
        setResumeName("Saved resume from your profile");
      } else {
        setResumeUrl("");
        setResumeName("");
      }
    }
  }, [open, jobSeeker]);

const applyMutation = trpc.jobSeeker.applications.submit.useMutation({
    onSuccess: async () => {
      toast.success("Application submitted successfully!");
      await utils.jobSeeker.applications.mine.invalidate();
      onOpenChange(false);
    },
    onError: (err) => {
      setError(err.message || "Failed to submit your application.");
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    const dataUrl = await readResumeFile(file);
    if (!dataUrl) {
      setUploadError("File is too large. Please upload a file under 5MB.");
      return;
    }
    setResumeUrl(dataUrl);
    setResumeName(file.name);
    // Reset so selecting the same file can trigger again.
    e.target.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!resumeUrl) {
      setError("Please attach your resume/CV to apply.");
      return;
    }
    applyMutation.mutate({
      jobId,
      resumeUrl,
      coverLetter: coverLetter.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Apply for {jobTitle}
          </DialogTitle>
          <DialogDescription>
            Submitting your application to {companyName}. Include your resume
            and a short cover letter to stand out.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Resume upload */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              Resume / CV <span className="text-destructive">*</span>
            </Label>
            {resumeUrl ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {resumeName || "Resume attached"}
                  </p>
                  <p className="text-xs text-green-600">
                    Ready to submit with your application.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setResumeUrl("");
                    setResumeName("");
                  }}
                  className="p-1.5 rounded-full hover:bg-green-100 transition-colors"
                  aria-label="Remove resume"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-secondary/40 hover:border-primary/50 rounded-lg p-8 flex flex-col items-center gap-2 transition-colors duration-300 group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <UploadCloud className="w-6 h-6 text-primary" />
                </div>
                <p className="font-semibold text-foreground">
                  Click to upload your resume/CV
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF or DOCX, up to 5MB
                </p>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileUpload}
              className="hidden"
            />
            {uploadError && (
              <p className="text-xs text-destructive">{uploadError}</p>
            )}
            {jobSeeker?.resumeUrl && (
              <p className="text-xs text-muted-foreground">
                Tip: You can also save a resume in your profile to auto-fill
                this field.
              </p>
            )}
          </div>

          {/* Cover letter */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              Cover Letter
            </Label>
            <Textarea
              placeholder="Introduce yourself and explain why you're a great fit for this role..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="border-2 border-secondary/30 focus:border-primary/50 rounded-lg min-h-[140px]"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm animate-in fade-in slide-in-from-top-2 duration-300">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-2 border-secondary/30 hover:border-primary/50 transition-colors duration-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={applyMutation.isPending}
              className="bg-gradient-to-r from-primary to-accent text-white font-bold px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 flex items-center gap-2"
            >
              {applyMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Application
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
