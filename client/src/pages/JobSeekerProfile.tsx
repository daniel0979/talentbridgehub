import { useJobSeekerAuth } from "@/_core/hooks/useJobSeekerAuth";
import PageLayout from "@/components/PageLayout";
import Container from "@/components/Container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ProfilePhotoCropDialog from "@/components/ProfilePhotoCropDialog";
import { getProfilePhotoValidationError } from "@/lib/profilePhotoCrop";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  MapPin,
  Briefcase,
  ImagePlus,
  Camera,
  Save,
  CheckCircle2,
  X,
  Sparkles,
  FileText,
  UploadCloud,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

const DESIRED_CATEGORIES = [
  "Technology",
  "Design",
  "Marketing",
  "Finance",
  "Engineering",
  "Healthcare",
  "Sales",
  "Education",
  "Human Resources",
  "Customer Support",
];

export default function JobSeekerProfile() {
const { jobSeeker, loading, refresh } = useJobSeekerAuth();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocationInput] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [desiredCategory, setDesiredCategory] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Populate form when the job seeker profile loads.
  useEffect(() => {
    if (!jobSeeker) return;
    setName(jobSeeker.name || "");
    setHeadline(jobSeeker.headline || "");
    setLocationInput(jobSeeker.location || "");
    setBio(jobSeeker.bio || "");
    setSkills(jobSeeker.skills || []);
    setPhotoUrl(jobSeeker.photoUrl || "");
    setResumeUrl(jobSeeker.resumeUrl || "");
    setResumeName(jobSeeker.resumeUrl ? "Saved resume" : "");
    setDesiredCategory(jobSeeker.desiredCategory || "");
  }, [jobSeeker]);

  const updateMutation = trpc.jobSeeker.profile.update.useMutation({
    onSuccess: () => {
      setSuccess("Profile saved successfully!");
      setTimeout(() => setSuccess(""), 4000);
      // Refetch the cached profile so the updated photo/fields display immediately.
      refresh();
      // After saving, return to the home page where the profile is accessible
      // from the navigation.
      setTimeout(() => setLocation("/"), 600);
    },
    onError: err => {
      setError(err.message || "Failed to save profile.");
    },
  });

  const photoUploadMutation = trpc.jobSeeker.uploads.profilePhoto.useMutation();
  const resumeUploadMutation = trpc.jobSeeker.uploads.resume.useMutation();

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      setSkillInput("");
      return;
    }
    setSkills(prev => [...prev, trimmed]);
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setSkills(prev => prev.filter(s => s !== skill));
  };

	const [photoError, setPhotoError] = useState("");
	
	const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError("");
    const validationError = getProfilePhotoValidationError(file);
		if (validationError) {
      setPhotoError(validationError);
      e.target.value = "";
      return;
    }
    setCropSource(current => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
    setCropOpen(true);
    e.target.value = "";
  };

  const handleCropOpenChange = (open: boolean) => {
    setCropOpen(open);
    if (!open) {
      setCropSource(current => {
        if (current) URL.revokeObjectURL(current);
        return null;
      });
    }
  };

  const handleCroppedPhoto = async (dataUrl: string) => {
    try {
      const uploaded = await photoUploadMutation.mutateAsync({ dataUrl });
      setPhotoUrl(uploaded.url);
      setCropSource(current => {
        if (current) URL.revokeObjectURL(current);
        return null;
      });
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Failed to upload image.");
      throw err;
    }
  };

  const [resumeError, setResumeError] = useState("");

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeError("");
    if (file.size > 5 * 1024 * 1024) {
      setResumeError("File is too large. Please upload a file under 5MB.");
      return;
    }
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Could not read the file."));
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
	  const uploaded = await resumeUploadMutation.mutateAsync({ dataUrl });
	  setResumeUrl(uploaded.url);
      setResumeName(file.name);
    } catch (err) {
      setResumeError(err instanceof Error ? err.message : "Failed to read file.");
    }
    // Reset the input value so selecting the same file again still triggers
    // the change event (allowing re-upload of the same file).
    e.target.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Your name is required.");
      return;
    }
	const updateInput: {
	  name: string;
	  headline: string | null;
	  location: string | null;
	  bio: string | null;
	  skills: string[];
	  desiredCategory: string | null;
	  photoUrl?: string | null;
	  resumeUrl?: string | null;
	} = {
	  name,
	  headline: headline || null,
	  location: location || null,
	  bio: bio || null,
	  skills,
	  desiredCategory: desiredCategory || null,
	};
	if (photoUrl !== (jobSeeker?.photoUrl || "")) updateInput.photoUrl = photoUrl || null;
	if (resumeUrl !== (jobSeeker?.resumeUrl || "")) updateInput.resumeUrl = resumeUrl || null;
	updateMutation.mutate(updateInput);
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-muted-foreground">Loading your profile…</p>
        </div>
      </PageLayout>
    );
  }

  if (!jobSeeker) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Sign in to view your profile
          </h1>
          <p className="text-muted-foreground mb-6">
            Please sign in or create an account to build your job seeker
            profile.
          </p>
          <Button
            onClick={() => setLocation("/")}
            className="bg-gradient-to-r from-primary to-accent text-white font-semibold"
          >
            Go to Home
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <section className="relative py-14 md:py-18 bg-gradient-to-br from-white via-secondary/10 to-primary/8 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/15 to-accent/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-semibold px-4 py-1.5 rounded-full mb-4">
                <User className="w-4 h-4" />
                Your Profile
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Build Your{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Job Seeker Profile
                </span>
              </h1>
              <p className="text-muted-foreground">
                Show employers who you are and what you can do.
              </p>
            </div>

            <Card className="p-8 bg-white border-2 border-primary/20 shadow-2xl rounded-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Photo upload */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt="Profile"
                        className="w-28 h-28 rounded-full object-cover border-4 border-primary/20 shadow-lg"
                      />
                    ) : (
                      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center border-4 border-primary/20">
                        <User className="w-12 h-12 text-primary" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:scale-110 transition-transform duration-300"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
	                  <input
	                    ref={fileInputRef}
	                    type="file"
		                    accept="image/png,image/jpeg,image/webp"
	                    onChange={handlePhotoSelect}
	                    className="hidden"
	                  />
	<p className="text-xs text-muted-foreground">
		                    Select a photo, crop it to fit your profile, then upload it securely.
	                  </p>
                  {photoError && (
                    <p className="text-xs text-destructive">{photoError}</p>
                  )}
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="pl-10 border-2 border-secondary/30 focus:border-primary/50 rounded-lg"
                    />
                  </div>
                </div>

                {/* Headline */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">
                    Professional Headline
                  </Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                    <Input
                      type="text"
                      placeholder="e.g. Senior Frontend Engineer"
                      value={headline}
                      onChange={e => setHeadline(e.target.value)}
                      className="pl-10 border-2 border-secondary/30 focus:border-primary/50 rounded-lg"
                    />
                  </div>
                </div>

                {/* Location + Desired category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">
                      Location
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                      <Input
                        type="text"
                        placeholder="Yangon, Myanmar"
                        value={location}
                        onChange={e => setLocationInput(e.target.value)}
                        className="pl-10 border-2 border-secondary/30 focus:border-primary/50 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">
                      Desired Category
                    </Label>
                    <Select
                      value={desiredCategory}
                      onValueChange={setDesiredCategory}
                    >
                      <SelectTrigger className="w-full border-2 border-secondary/30 focus:border-primary/50 rounded-lg">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {DESIRED_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">
                    Skills
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="e.g. React, TypeScript, UX"
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      className="flex-1 border-2 border-secondary/30 focus:border-primary/50 rounded-lg"
                    />
                    <Button
                      type="button"
                      onClick={addSkill}
                      className="bg-gradient-to-r from-primary to-accent text-white font-semibold"
                    >
                      Add
                    </Button>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {skills.map(skill => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
                        >
                          <Sparkles className="w-3 h-3" />
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-1 text-primary/60 hover:text-primary transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

{/* Bio */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">
                    About Me
                  </Label>
                  <Textarea
                    placeholder="Tell employers about your experience, strengths, and career goals..."
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    className="border-2 border-secondary/30 focus:border-primary/50 rounded-lg min-h-[120px]"
                  />
                </div>

                {/* Resume / CV upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">
                    Resume / CV
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
                          Saved to your profile and auto-filled when you apply
                          for jobs.
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
                      onClick={() => resumeInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-secondary/40 hover:border-primary/50 rounded-lg p-8 flex flex-col items-center gap-2 transition-colors duration-300 group"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <UploadCloud className="w-6 h-6 text-primary" />
                      </div>
                      <p className="font-semibold text-foreground">
                        Upload your resume/CV
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF or DOCX, up to 5MB — saved to your profile
                      </p>
                    </button>
                  )}
                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                  {resumeError && (
                    <p className="text-xs text-destructive">{resumeError}</p>
                  )}
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 animate-in fade-in slide-in-from-top-2 duration-300">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    {success}
                  </div>
                )}

                <Button
                  type="submit"
	                  disabled={updateMutation.isPending || photoUploadMutation.isPending || resumeUploadMutation.isPending}
                  className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
	                  {photoUploadMutation.isPending || resumeUploadMutation.isPending
	                    ? "Uploading file…"
	                    : updateMutation.isPending
	                      ? "Saving…"
	                      : "Save Profile"}
                </Button>
              </form>
            </Card>
          </div>
	        </Container>
	      </section>
	      <ProfilePhotoCropDialog imageSource={cropSource} open={cropOpen} onOpenChange={handleCropOpenChange} onConfirm={handleCroppedPhoto} />
	    </PageLayout>
  );
}
