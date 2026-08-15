import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 bg-gradient-to-br from-white via-secondary/10 to-primary/8 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/15 to-accent/10 rounded-full blur-3xl -mr-48 -mt-48" />
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
                Privacy{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Policy
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Last updated: July 2026
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="max-w-3xl mx-auto prose prose-sm">
              <div className="space-y-8 text-muted-foreground leading-relaxed">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    1. Introduction
                  </h2>
                  <p>
                    JobSeeker ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    2. Information We Collect
                  </h2>
                  <p>
                    We may collect information about you in a variety of ways. The information we may collect on the site includes:
                  </p>
                  <ul className="list-disc list-inside space-y-2 mt-4">
                    <li>
                      <strong>Personal Data:</strong> Name, email address, phone number, resume, and other information you voluntarily provide.
                    </li>
                    <li>
                      <strong>Device Data:</strong> Information about your device, including IP address, browser type, and operating system.
                    </li>
                    <li>
                      <strong>Usage Data:</strong> Information about how you interact with our website and services.
                    </li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    3. Use of Your Information
                  </h2>
                  <p>
                    Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the site to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 mt-4">
                    <li>Generate a personal profile and record of your preferences</li>
                    <li>Increase the efficiency and operation of the site</li>
                    <li>Monitor and analyze trends, usage, and activities</li>
                    <li>Notify you of updates to the site</li>
                    <li>Offer new products, services, and/or recommendations</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    4. Disclosure of Your Information
                  </h2>
                  <p>
                    We may share information we have collected about you in certain situations:
                  </p>
                  <ul className="list-disc list-inside space-y-2 mt-4">
                    <li>
                      <strong>By Law or to Protect Rights:</strong> If required by law or if we believe in good faith that disclosure is necessary.
                    </li>
                    <li>
                      <strong>Third-Party Service Providers:</strong> We may share your information with vendors, consultants, and other service providers.
                    </li>
                    <li>
                      <strong>Business Transfers:</strong> Your information may be transferred as part of a merger, acquisition, or sale of assets.
                    </li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    5. Security of Your Information
                  </h2>
                  <p>
                    We use administrative, technical, and physical security measures to protect your personal information. However, perfect security does not exist on the Internet.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    6. Contact Us
                  </h2>
                  <p>
                    If you have questions or comments about this Privacy Policy, please contact us at:
                  </p>
                  <div className="mt-4 p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                    <p className="font-semibold text-foreground">JobSeeker</p>
                    <p>Email: privacy@jobseeker.com</p>
<p>Phone: 09743218338</p>
                    <p>Address: 123 Job Street, Tech City, TC 12345</p>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    7. Changes to This Privacy Policy
                  </h2>
                  <p>
                    We may update this Privacy Policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons. We will notify you of any changes by updating the "Last updated" date of this Privacy Policy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
