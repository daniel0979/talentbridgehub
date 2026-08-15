import { Mail, Facebook, Linkedin, Twitter } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ];

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter", color: "hover:text-blue-400" },
    { icon: Linkedin, href: "#", label: "LinkedIn", color: "hover:text-blue-700" },
    { icon: Facebook, href: "#", label: "Facebook", color: "hover:text-blue-600" },
  ];

  return (
    <footer className="bg-gradient-to-b from-background to-primary/5 border-t border-secondary/20 mt-20">
      <div className="container py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Link href="/">
              <span className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 cursor-pointer mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                  TB
                </div>
                <span>TalentBridgeHub</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              A practical bridge between job seekers and employers, with a structured application and moderation workflow.
            </p>
          </div>

          {/* Quick Links */}
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-700 animation-delay-100">
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-muted-foreground hover:text-primary transition-colors duration-300 cursor-pointer text-sm">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-700 animation-delay-200">
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-3">
              {[
                { label: "Browse Jobs", href: "/jobs" },
                { label: "Companies", href: "/companies" },
                { label: "Career Tips", href: "/tips" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-muted-foreground hover:text-primary transition-colors duration-300 cursor-pointer text-sm">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-700 animation-delay-300">
            <h4 className="font-semibold text-foreground mb-4">Stay Updated</h4>
            <p className="text-muted-foreground text-sm mb-4">
              Subscribe to get the latest job opportunities.
            </p>
            <div className="flex items-center gap-2 bg-secondary/30 rounded-lg px-3 py-2 border border-secondary/50 hover:border-primary/30 transition-colors duration-300">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Your email"
                className="bg-transparent outline-none text-sm flex-1 placeholder-muted-foreground"
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-secondary/20 mb-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-muted-foreground text-sm text-center md:text-left animate-in fade-in slide-in-from-bottom-2 duration-700">
            © {currentYear} TalentBridgeHub. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700 animation-delay-100">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  className={`text-muted-foreground ${social.color} transition-all duration-300 transform hover:scale-110 p-2 rounded-lg hover:bg-secondary/30`}
                  title={social.label}
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
