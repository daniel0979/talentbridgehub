import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Users, Target, Zap, Heart, MapPin } from "lucide-react";

export default function About() {
  const values = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Our Mission",
      description:
        "To connect talented professionals with their dream opportunities and help companies find the perfect talent.",
      color: "from-primary to-primary",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Our Community",
      description:
        "We create a shared space where job seekers, employers, and administrators can manage recruitment activities clearly and responsibly.",
      color: "from-accent to-accent",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Innovation",
      description:
        "We continuously innovate to make job searching easier, faster, and more effective for everyone.",
      color: "from-primary via-primary to-accent",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Passion",
      description:
        "We're passionate about helping people find work they love and companies build amazing teams.",
      color: "from-accent to-primary",
    },
  ];

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
                About{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  TalentBridgeHub
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                We're building the future of job searching by connecting talented professionals with opportunities that matter.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p>
                  TalentBridgeHub was created as a structured recruitment platform for making job discovery and employer hiring workflows more accessible. It brings job listings, applicant profiles, and moderated company participation into one place.
                </p>
                <p>
                  The platform supports role-based access for job seekers, companies, and administrators. Job seekers can manage profiles and applications, employers can publish opportunities after approval, and administrators can moderate content and manage platform activity.
                </p>
                <p>
                  The project focuses on making the recruitment process clearer: finding a role, submitting an application, reviewing candidates, and tracking relevant notifications should be manageable without relying on disconnected tools.
                </p>
              </div>
            </div>
          </div>
        </section>

{/* Founder & CEO Section */}
        <section className="py-20 bg-gradient-to-b from-secondary/5 to-background">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-3">
                Meet Our Founder
              </h2>
              <p className="text-muted-foreground text-lg">
                The vision behind TalentBridgeHub
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <Card className="p-0 bg-white border-2 border-primary/20 hover:shadow-2xl hover:border-primary/40 transition-all duration-300 overflow-hidden group">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Large image on the left with a visible border */}
                  <div className="relative md:border-r-2 border-primary/20">
                    <img
                      src="/manus-storage/aung-khant-min_9c220e59.jpg"
                      alt="Aung Khant Min"
                      className="w-full h-64 md:h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-700"
                    />
                  </div>

                  {/* Details on the right */}
                  <div className="p-8 md:p-10 flex flex-col justify-center">
                    <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                      Aung Khant Min
                    </h3>
                    <p className="text-primary font-semibold text-lg mb-4">
                      Founder &amp; CEO
                    </p>

                    <div className="flex items-center gap-2 text-muted-foreground mb-6">
                      <MapPin className="w-5 h-5 text-accent" />
                      <span className="font-medium">Myanmar</span>
                    </div>

                    <p className="text-muted-foreground leading-relaxed">
                      Aung Khant Min created TalentBridgeHub with a clear vision:
                      to make the recruitment journey easier to manage for both
                      job seekers and employers. The platform is designed around
                      meaningful opportunities, practical employer tools, and
                      transparent administrative oversight.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-gradient-to-b from-secondary/5 to-background">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-3">Our Values</h2>
              <p className="text-muted-foreground text-lg">
                These principles guide everything we do
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value, idx) => (
                <Card
                  key={idx}
                  className="p-8 bg-white border-2 border-secondary/20 hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${value.color} text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gradient-to-r from-primary via-primary to-accent text-white">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {[
                { number: "01", label: "Job-seeker portal" },
                { number: "02", label: "Employer workflow" },
                { number: "03", label: "Admin moderation" },
              ].map((stat, idx) => (
                <div key={idx}>
                  <div className="text-4xl md:text-5xl font-bold mb-2">
                    {stat.number}
                  </div>
                  <p className="text-white/80">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white">
          <div className="container text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Ready to Explore New Opportunities?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Create your profile, explore approved listings, and manage your applications through TalentBridgeHub.
            </p>
            <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary via-primary to-accent text-white font-bold hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105 active:scale-95">
              Start Your Search
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
