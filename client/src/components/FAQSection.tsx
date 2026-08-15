import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 1,
    question: "How do I create an account on JobSeeker Pro?",
    answer:
      "Creating an account is simple! Click the 'Sign In' button in the top right corner, authenticate with your preferred method, and you're ready to start applying for jobs. Your profile will be automatically created.",
  },
  {
    id: 2,
    question: "Is JobSeeker Pro free to use?",
    answer:
      "Yes, JobSeeker Pro is completely free for job seekers. You can search, filter, and apply to jobs without any subscription fees. We believe in making job hunting accessible to everyone.",
  },
  {
    id: 3,
    question: "How often are job listings updated?",
    answer:
      "Our job listings are updated in real-time. New opportunities are added constantly throughout the day, so you'll always have access to the latest positions from top companies.",
  },
  {
    id: 4,
    question: "Can I set up job alerts?",
    answer:
      "Yes! Subscribe to our newsletter to receive weekly job recommendations tailored to your skills and preferences. You can also customize your alert preferences in your account settings.",
  },
  {
    id: 5,
    question: "How do I apply for a job?",
    answer:
      "Simply click on a job listing that interests you, review the details, and click the 'Apply Now' button. You can customize your resume and cover letter for each application.",
  },
  {
    id: 6,
    question: "What should I do if I encounter a problem?",
    answer:
      "If you experience any issues, please contact our support team through the 'Contact' page. We're here to help and typically respond within 24 hours.",
  },
];

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (id: number) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section className="py-20 bg-gradient-to-b from-secondary/20 to-background">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-lg">
              Find answers to common questions about JobSeeker Pro
            </p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, idx) => (
              <Collapsible
                key={item.id}
                open={openItems.includes(item.id)}
                onOpenChange={() => toggleItem(item.id)}
                className="animate-in fade-in slide-in-from-bottom-3 duration-700"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <Card className="p-6 hover:shadow-lg transition-all duration-300 border-2 border-secondary/20 hover:border-primary/30 group cursor-pointer bg-gradient-to-br from-white to-secondary/5">
                  <CollapsibleTrigger className="flex items-center justify-between w-full">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300 text-left">
                      {item.question}
                    </h3>
                    <ChevronDown
                      className={`w-5 h-5 text-primary transition-transform duration-300 flex-shrink-0 ${
                        openItems.includes(item.id) ? "rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>

                  <CollapsibleContent className="mt-4 pt-4 border-t border-secondary/20">
                    <p className="text-muted-foreground leading-relaxed">
                      {item.answer}
                    </p>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
