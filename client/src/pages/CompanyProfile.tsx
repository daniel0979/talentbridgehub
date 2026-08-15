import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Building2,
  Globe,
  MapPin,
  Phone,
  User,
  Save,
  Sparkles,
  Upload,
  ShieldCheck,
} from "lucide-react";
import { useCompanyAuth } from "@/_core/hooks/useCompanyAuth";
import { useState } from "react";
import { toast } from "sonner";

const COMPANY_COLORS = [
  "from-blue-500 to-blue-600",
  "from-pink-500 to-pink-600",
  "from-green-500 to-green-600",
  "from-orange-500 to-orange-600",
  "from-indigo-500 to-indigo-600",
  "from-teal-500 to-teal-600",
  "from-purple-500 to-purple-600",
  "from-red-500 to-red-600",
];

export default function CompanyProfile() {
  const { company } = useCompanyAuth();
  const utils = trpc.useUtils();

  const [name, setName] = useState(company?.name ?? "");
  const [industry, setIndustry] = useState(company?.industry ?? "");
  const [town, setTown] = useState(company?.town ?? "");
  const [phone, setPhone] = useState(company?.phone ?? "");
  const [website, setWebsite] = useState(company?.website ?? "");
  const [contactName, setContactName] = useState(company?.contactName ?? "");
  const [description, setDescription] = useState(company?.description ?? "");
  const [logoUrl, setLogoUrl] = useState(company?.logoUrl ?? "");
  const [logoPreview, setLogoPreview] = useState(company?.logoUrl ?? "");

  const updateMutation = trpc.company.profile.update.useMutation({
    onSuccess: async (updated) => {
      await utils.company.auth.me.invalidate();
      toast.success("Company profile updated successfully!");
      // Sync local state with the returned updated profile.
      if (updated) {
        setName(updated.name ?? "");
        setIndustry(updated.industry ?? "");
        setTown(updated.town ?? "");
        setPhone(updated.phone ?? "");
        setWebsite(updated.website ?? "");
        setContactName(updated.contactName ?? "");
        setDescription(updated.description ?? "");
        setLogoUrl(updated.logoUrl ?? "");
        setLogoPreview(updated.logoUrl ?? "");
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update profile.");
    },
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be smaller than 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      setLogoUrl(result);
      setLogoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Company name is required.");
      return;
    }
    updateMutation.mutate({
      name: name.trim(),
      industry: industry || null,
      town: town || null,
      phone: phone || null,
      website: website || null,
      contactName: contactName || null,
      description: description || null,
      logoUrl: logoUrl || null,
    });
  };

  const initials = (name || "C").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const color = COMPANY_COLORS[(name || "").length % COMPANY_COLORS.length];

  return (
    <>
      {/* Header */}
      <section className="relative py-12 md:py-16 bg-gradient-to-br from-white via-secondary/10 to-primary/8 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/15 to-accent/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="container relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-semibold px-4 py-1.5 rounded-full mb-6">
            <ShieldCheck className="w-4 h-4" />
            Company Profile
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Edit Your Company{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Profile
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Keep your company information up to date so job seekers can learn about you and trust your brand.
          </p>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-b from-background to-secondary/10">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-8 bg-white border-2 border-secondary/20">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Company Information
                  </h3>

                  <div className="space-y-5">
                    {/* Logo */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Upload className="w-4 h-4 text-primary" />
                        Company Logo
                      </Label>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 rounded-xl border-2 border-secondary/30 shadow-lg">
                          {logoPreview ? (
                            <AvatarImage src={logoPreview} alt={name} className="object-contain bg-white" />
                          ) : null}
                          <AvatarFallback className={`text-2xl font-bold bg-gradient-to-br ${color} text-white`}>
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <label className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-primary/30 text-primary hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors duration-300 text-sm font-semibold">
                            <Upload className="w-4 h-4" />
                            Upload Logo
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleLogoUpload}
                            />
                          </label>
                          {logoPreview && (
                            <button
                              type="button"
                              onClick={() => {
                                setLogoUrl("");
                                setLogoPreview("");
                              }}
                              className="block text-xs text-destructive hover:underline"
                            >
                              Remove logo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-foreground">
                          Company Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. TechNova"
                          className="border-2 border-secondary/30 focus:border-primary/50 rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" />
                            Industry
                          </span>
                        </Label>
                        <Input
                          type="text"
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          placeholder="e.g. Technology"
                          className="border-2 border-secondary/30 focus:border-primary/50 rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-foreground">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-primary" />
                            Town / Location
                          </span>
                        </Label>
                        <Input
                          type="text"
                          value={town}
                          onChange={(e) => setTown(e.target.value)}
                          placeholder="e.g. New York, NY"
                          className="border-2 border-secondary/30 focus:border-primary/50 rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-primary" />
                            Phone
                          </span>
                        </Label>
                        <Input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +1 (555) 000-0000"
                          className="border-2 border-secondary/30 focus:border-primary/50 rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5 text-primary" />
                            Website
                          </span>
                        </Label>
                        <Input
                          type="text"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://example.com"
                          className="border-2 border-secondary/30 focus:border-primary/50 rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-foreground">
                          <span className="inline-flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-primary" />
                            Contact Person
                          </span>
                        </Label>
                        <Input
                          type="text"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="e.g. Jane Doe"
                          className="border-2 border-secondary/30 focus:border-primary/50 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground">
                        Company Description
                      </Label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Tell job seekers about your company, culture, and mission..."
                        className="border-2 border-secondary/30 focus:border-primary/50 rounded-lg min-h-[140px]"
                      />
                    </div>
                  </div>
                </Card>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="bg-gradient-to-r from-primary to-accent text-white font-bold px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                  <span className="self-center text-sm text-muted-foreground ml-2">
                    {updateMutation.isPending ? "Saving…" : "Your changes become public instantly."}
                  </span>
                </div>
              </form>
            </div>

            {/* Live Preview */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                Live Preview
              </h3>
              <Card className="p-8 hover:shadow-2xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-2 group bg-gradient-to-br from-white to-secondary/5 border-2 border-secondary/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <Avatar className={`w-16 h-16 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      {logoPreview ? (
                        <AvatarImage src={logoPreview} alt={name} className="object-contain bg-white" />
                      ) : null}
                      <AvatarFallback className="bg-transparent text-white font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {industry && (
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/30 text-xs"
                      >
                        {industry}
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-2xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                    {name || "Your Company Name"}
                  </h3>

                  {description && (
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3 group-hover:text-foreground transition-colors duration-300">
                      {description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm text-muted-foreground">
                    {town && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        {town}
                      </div>
                    )}
                    {website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        {website}
                      </div>
                    )}
                    {phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-primary" />
                        {phone}
                      </div>
                    )}
                    {contactName && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        {contactName}
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <p className="text-xs text-muted-foreground leading-relaxed">
                This is how your company card appears to job seekers on the Companies page. Update your logo and details to build trust.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

