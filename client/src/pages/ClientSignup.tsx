import PageLayout from "@/components/PageLayout";
import Container from "@/components/Container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  ImagePlus,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Globe,
  Clock,
  PhoneCall,
  FileText,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useCompanyAuth } from "@/_core/hooks/useCompanyAuth";

const ADMIN_CONTACT_PHONE = "09743218338";

const INDUSTRIES = [
  "Technology",
  "Design",
  "Marketing",
  "Finance",
  "Engineering",
  "Healthcare",
  "Sales",
  "Education",
  "Government",
  "Other",
];

export default function ClientSignup() {
  const [, setLocation] = useLocation();
  const { register } = useCompanyAuth();
  const [submitting, setSubmitting] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocationInput] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [logoName, setLogoName] = useState("");
const [showPassword, setShowPassword] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState("");

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoName(file.name);
    // In the backend phase, this file will be uploaded via Multer to the
    // server and stored. For now, preview it locally in the browser.
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await register({
        name: companyName.trim(),
        ownerEmail: email.trim(),
        password,
        contactName: companyName.trim(),
        phone,
        industry,
        town: location,
        description,
        website: website.trim() || undefined,
logoUrl: logo ?? undefined,
      });
      setRegistered(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

return (
    <PageLayout>
      {registered ? (
        <section className="relative py-16 md:py-20 bg-gradient-to-br from-white via-secondary/10 to-primary/8 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/15 to-accent/10 rounded-full blur-3xl -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl -ml-40 -mb-40" />
          <Container className="relative z-10">
            <div className="max-w-2xl mx-auto">
              <Card className="p-8 md:p-10 bg-white border-2 border-primary/20 shadow-2xl rounded-2xl">
                {/* Letter header */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg">
                    <FileText className="w-10 h-10" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                    Your Account is Pending Approval
                  </h1>
                  <p className="text-muted-foreground max-w-lg mx-auto">
                    Thank you for registering <span className="font-semibold text-foreground">{companyName}</span> with JobSeeker. Your account has been created and is currently waiting for approval from our administrator.
                  </p>
                </div>

                {/* Approval notice */}
                <div className="p-6 rounded-2xl bg-secondary/20 border-2 border-secondary/30 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="font-bold text-foreground mb-1">
                        Awaiting Admin Approval
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        You will be able to post jobs and manage your listings
                        once an administrator approves your account. Please allow
                        some time for the review process to complete.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact info */}
                <div className="p-6 rounded-2xl bg-primary/5 border-2 border-primary/20 mb-8">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shrink-0">
                      <PhoneCall className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h2 className="font-bold text-foreground mb-1">
                        Need help or have questions?
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        If you have any questions about your approval or need
                        assistance, feel free to contact us at:
                      </p>
                      <a
                        href={`tel:${ADMIN_CONTACT_PHONE}`}
                        className="inline-flex items-center gap-2 mt-2 text-primary font-bold text-lg hover:text-accent transition-colors"
                      >
                        <Phone className="w-5 h-5" />
                        {ADMIN_CONTACT_PHONE}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => setLocation("/client/dashboard")}
                    className="flex-1 bg-gradient-to-r from-primary via-primary to-accent text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Go to My Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setLocation("/")}
                    className="flex-1 border-2 border-secondary/30 hover:border-primary/50 text-foreground font-semibold py-3 rounded-lg transition-colors duration-300"
                  >
                    Back to Home
                  </Button>
                </div>
              </Card>
            </div>
          </Container>
        </section>
) : (
      <section className="relative py-16 md:py-20 bg-gradient-to-br from-white via-secondary/10 to-primary/8 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/15 to-accent/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl -ml-40 -mb-40" />
        <Container className="relative z-10">
          <div className="max-w-2xl mx-auto">
              <Card className="p-8 bg-white border-2 border-primary/20 shadow-2xl rounded-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    Create Your Company Account
                  </h1>
                  <p className="text-muted-foreground">
                    Join JobSeeker and start posting jobs to reach top talent
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Logo upload */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">
                      Company Logo
                    </Label>
                    <label className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-secondary/30 hover:border-primary/50 rounded-xl cursor-pointer transition-colors duration-300 bg-secondary/20 text-center">
                      {logo ? (
                        <img
                          src={logo}
                          alt="Company logo preview"
                          className="w-20 h-20 rounded-xl object-cover shadow-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                          <ImagePlus className="w-8 h-8 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-foreground">
                          {logoName || "Upload your company logo"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          PNG, JPG or SVG up to 5MB
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Company name */}
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-sm font-semibold text-foreground">
                      Company Name <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                      <Input
                        id="companyName"
                        type="text"
                        placeholder="Acme Corp"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="pl-10 border-2 border-secondary/30 focus:border-primary/50 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Email + Industry */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                        Email Address <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="hr@acme.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 border-2 border-secondary/30 focus:border-primary/50 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground">
                        Industry
                      </Label>
                      <Select value={industry} onValueChange={setIndustry}>
                        <SelectTrigger className="w-full border-2 border-secondary/30 focus:border-primary/50 rounded-lg">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {INDUSTRIES.map((ind) => (
                            <SelectItem key={ind} value={ind}>
                              {ind}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Location + Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground">
                        Location / Town
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                        <Input
                          type="text"
                          placeholder="San Francisco, CA"
                          value={location}
                          onChange={(e) => setLocationInput(e.target.value)}
                          className="pl-10 border-2 border-secondary/30 focus:border-primary/50 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
<Input
                          type="tel"
                          placeholder="09 000 000000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="pl-10 border-2 border-secondary/30 focus:border-primary/50 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

{/* Website */}
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-sm font-semibold text-foreground">
                      Company Website
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://www.acmecorp.com"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="pl-10 border-2 border-secondary/30 focus:border-primary/50 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Password + Confirm */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                        Password <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 border-2 border-secondary/30 focus:border-primary/50 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
                        Confirm Password <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                        <Input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10 border-2 border-secondary/30 focus:border-primary/50 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Company description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold text-foreground">
                      Company Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Tell job seekers a little about your company..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="border-2 border-secondary/30 focus:border-primary/50 rounded-lg min-h-[100px]"
                    />
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                      {error}
                    </div>
                  )}

{/* Submit */}
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-primary via-primary to-accent text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Creating account…" : "Create Company Account"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-secondary/20" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-muted-foreground">already have an account?</span>
                  </div>
                </div>

                {/* Login link */}
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">
                    Already registered?{" "}
                    <Link href="/client/login">
                      <span className="text-primary hover:text-accent font-bold transition-colors duration-300 cursor-pointer">
                        Sign in here
                      </span>
                    </Link>
                  </p>
                </div>

{/* Post-signup note */}
                <div className="mt-6 p-4 rounded-xl bg-secondary/20 border border-secondary/30 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    After creating your account, you'll be able to post jobs, manage your listings, and edit or delete only your own posts.
                  </p>
                </div>
              </Card>
            </div>
          </Container>
        </section>
      )}
    </PageLayout>
  );
}
