import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { submitContactMessage } from "@/lib/contactForm";
import { AlertCircle, CheckCircle2, Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { FormEvent, useState } from "react";

type SubmissionState = "idle" | "submitting" | "success" | "error";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [honeypot, setHoneypot] = useState("");
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [submissionError, setSubmissionError] = useState("");
  const update = (field: keyof typeof formData, value: string) => setFormData(current => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (honeypot) { setSubmissionState("success"); return; }
    setSubmissionState("submitting");
    setSubmissionError("");
    try {
      await submitContactMessage({ ...formData, honeypot });
      setSubmissionState("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setSubmissionState("error");
      setSubmissionError(error instanceof Error ? error.message : "We could not send your message. Please try again shortly.");
    }
  };

  const contactInfo = [
    { icon: <Mail className="w-6 h-6" />, title: "Email", content: "akmdaniel2@gmail.com", color: "from-primary to-primary" },
    { icon: <Phone className="w-6 h-6" />, title: "Phone", content: "09743218338", color: "from-accent to-accent" },
    { icon: <MapPin className="w-6 h-6" />, title: "Address", content: "123 Job Street, Tech City, TC 12345", color: "from-primary via-primary to-accent" },
    { icon: <Clock className="w-6 h-6" />, title: "Hours", content: "Mon - Fri: 9AM - 6PM EST", color: "from-accent to-primary" },
  ];

  return <div className="min-h-screen flex flex-col bg-background">
    <Navigation />
    <main className="flex-1">
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-white via-secondary/10 to-primary/8 overflow-hidden"><div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/15 to-accent/10 rounded-full blur-3xl -mr-48 -mt-48" /><div className="container relative z-10"><div className="max-w-3xl mx-auto text-center"><h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">Get in <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Touch</span></h1><p className="text-xl text-muted-foreground">We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.</p></div></div></section>
      <section className="py-20 bg-white"><div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">{contactInfo.map((info, index) => <Card key={index} className="p-6 bg-gradient-to-br from-white to-secondary/5 border-2 border-secondary/20 hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group text-center"><div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${info.color} text-white flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>{info.icon}</div><h3 className="font-bold text-foreground mb-2">{info.title}</h3><p className="text-muted-foreground text-sm">{info.content}</p></Card>)}</div>
        <div className="max-w-2xl mx-auto"><Card className="p-8 bg-gradient-to-br from-white to-secondary/5 border-2 border-secondary/20"><h2 className="text-2xl font-bold text-foreground mb-2">Send us a Message</h2><p className="text-sm text-muted-foreground mb-6">No account sign-in is required. Your message will be delivered directly to our team.</p>
          {submissionState === "success" && <div role="status" className="mb-6 flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-950"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" /><div><p className="font-semibold">Your message has been sent.</p><p className="mt-1 text-sm text-emerald-800">Thank you for contacting TalentBridgeHub. We will reply to the email address you provided.</p></div></div>}
          {submissionState === "error" && <div role="alert" className="mb-6 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-950"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" /><div><p className="font-semibold">Your message was not sent.</p><p className="mt-1 text-sm text-red-800">{submissionError}</p></div></div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="text" name="_honey" value={honeypot} onChange={event => setHoneypot(event.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label htmlFor="contact-name" className="block text-sm font-semibold text-foreground mb-2">Name</label><Input id="contact-name" type="text" name="name" placeholder="Your name" value={formData.name} onChange={event => update("name", event.target.value)} required minLength={2} maxLength={100} className="border-2 border-secondary/30 focus:border-primary/50 rounded-lg" /></div><div><label htmlFor="contact-email" className="block text-sm font-semibold text-foreground mb-2">Email</label><Input id="contact-email" type="email" name="email" placeholder="your@email.com" value={formData.email} onChange={event => update("email", event.target.value)} required maxLength={254} className="border-2 border-secondary/30 focus:border-primary/50 rounded-lg" /></div></div>
            <div><label htmlFor="contact-subject" className="block text-sm font-semibold text-foreground mb-2">Subject</label><Input id="contact-subject" type="text" name="subject" placeholder="What is this about?" value={formData.subject} onChange={event => update("subject", event.target.value)} required minLength={3} maxLength={160} className="border-2 border-secondary/30 focus:border-primary/50 rounded-lg" /></div>
            <div><label htmlFor="contact-message" className="block text-sm font-semibold text-foreground mb-2">Message</label><textarea id="contact-message" name="message" placeholder="Your message..." value={formData.message} onChange={event => update("message", event.target.value)} required minLength={10} maxLength={5000} rows={6} className="w-full border-2 border-secondary/30 focus:border-primary/50 rounded-lg px-4 py-3 focus:outline-none transition-colors duration-300" /></div>
            <Button type="submit" disabled={submissionState === "submitting"} className="w-full bg-gradient-to-r from-primary via-primary to-accent text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105 active:scale-95">{submissionState === "submitting" ? "Sending message…" : <><Send className="mr-2 h-4 w-4" />Send Message</>}</Button>
          </form>
        </Card></div>
      </div></section>
      <section className="py-20 bg-gradient-to-b from-secondary/5 to-background"><div className="container"><div className="max-w-2xl mx-auto"><h2 className="text-3xl font-bold text-foreground mb-12 text-center">Frequently Asked Questions</h2><div className="space-y-4">{[{ q: "What is the response time for support inquiries?", a: "We typically respond to all inquiries within 24 hours during business days." }, { q: "Can I schedule a call with the team?", a: "Yes! Please mention your preferred time in the message and we'll get back to you with available slots." }, { q: "Do you offer phone support?", a: "Currently, we support inquiries via email and contact form. Phone support is available for enterprise clients." }].map((faq, index) => <Card key={index} className="p-6 bg-white border-2 border-secondary/20 hover:border-primary/50 transition-all duration-300"><h3 className="font-bold text-foreground mb-2">{faq.q}</h3><p className="text-muted-foreground">{faq.a}</p></Card>)}</div></div></div></section>
    </main><Footer />
  </div>;
}
