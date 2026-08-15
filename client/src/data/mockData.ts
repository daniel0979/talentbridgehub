// ---------------------------------------------------------------------------
// Shared mock data for the Job Seeker & Client portals.
// These pages are static/frontend for now and will be wired to the MySQL
// backend (jobs, companies, job_categories) in a later timebox.
//
// Ownership model: every job belongs to a `clientId` (the company account that
// created it). Editing/deleting is only permitted for the owning client.
// ---------------------------------------------------------------------------

export interface JobPost {
  id: number;
  title: string;
  company: string;
  companyLogo: string; // initials or image URL
  companyColor: string; // tailwind gradient classes for logo fallback
  description: string;
  salary: string;
  location: string;
  jobType: string;
  category: string;
  postedAt: string;
  clientId: number; // owning company account id
}

export interface CompanyPartner {
  id: number;
  name: string;
  logo: string; // initials
  color: string;
  industry: string;
  rating: number;
  jobCount: number;
  quote: string;
  role: string;
}

export interface CareerTip {
  id: number;
  title: string;
  category: string;
  readTime: string;
  excerpt: string;
  content: string[];
}

export const JOB_CATEGORIES = [
  "Technology",
  "Design",
  "Marketing",
  "Finance",
  "Engineering",
  "Healthcare",
  "Sales",
  "Education",
];

export const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];

export const LOCATIONS = [
  "Remote",
  "New York, NY",
  "San Francisco, CA",
  "Chicago, IL",
  "Austin, TX",
  "Boston, MA",
  "Seattle, WA",
  "Denver, CO",
  "Miami, FL",
];

export const JOBS: JobPost[] = [
  {
    id: 1,
    title: "Senior Frontend Engineer",
    company: "TechNova",
    companyLogo: "TN",
    companyColor: "from-blue-500 to-blue-600",
    description:
      "Build delightful, accessible user interfaces with React and TypeScript. Own features end-to-end and mentor junior engineers.",
    salary: "$120k - $160k",
    location: "Remote",
    jobType: "Full-time",
    category: "Technology",
    postedAt: "2 days ago",
    clientId: 1,
  },
  {
    id: 2,
    title: "Backend Developer",
    company: "TechNova",
    companyLogo: "TN",
    companyColor: "from-blue-500 to-blue-600",
    description:
      "Design and scale REST APIs and microservices in Node.js. Work with a modern cloud-native stack.",
    salary: "$110k - $150k",
    location: "New York, NY",
    jobType: "Full-time",
    category: "Technology",
    postedAt: "1 day ago",
    clientId: 1,
  },
  {
    id: 3,
    title: "UI/UX Designer",
    company: "DesignWorks",
    companyLogo: "DW",
    companyColor: "from-pink-500 to-pink-600",
    description:
      "Create intuitive designs and design systems for web products. Collaborate closely with product and engineering.",
    salary: "$90k - $130k",
    location: "San Francisco, CA",
    jobType: "Full-time",
    category: "Design",
    postedAt: "3 days ago",
    clientId: 2,
  },
  {
    id: 4,
    title: "Product Designer",
    company: "DesignWorks",
    companyLogo: "DW",
    companyColor: "from-pink-500 to-pink-600",
    description:
      "Own end-to-end product design from research to handoff. Strong prototyping skills required.",
    salary: "$80k - $120k",
    location: "Remote",
    jobType: "Contract",
    category: "Design",
    postedAt: "5 days ago",
    clientId: 2,
  },
  {
    id: 5,
    title: "Financial Analyst",
    company: "FinEdge",
    companyLogo: "FE",
    companyColor: "from-green-500 to-green-600",
    description:
      "Analyze financial data and support investment decisions. Prepare reports and financial models.",
    salary: "$85k - $115k",
    location: "Chicago, IL",
    jobType: "Full-time",
    category: "Finance",
    postedAt: "4 days ago",
    clientId: 3,
  },
  {
    id: 6,
    title: "Data Analyst",
    company: "FinEdge",
    companyLogo: "FE",
    companyColor: "from-green-500 to-green-600",
    description:
      "Turn raw data into actionable insights for stakeholders. Build dashboards and run analysis.",
    salary: "$90k - $120k",
    location: "Austin, TX",
    jobType: "Full-time",
    category: "Technology",
    postedAt: "1 day ago",
    clientId: 3,
  },
  {
    id: 7,
    title: "Digital Marketing Specialist",
    company: "MarketSphere",
    companyLogo: "MS",
    companyColor: "from-orange-500 to-orange-600",
    description:
      "Plan and execute campaigns across SEO, PPC, and social. Optimize funnels and report on growth.",
    salary: "$70k - $95k",
    location: "Remote",
    jobType: "Full-time",
    category: "Marketing",
    postedAt: "6 days ago",
    clientId: 4,
  },
  {
    id: 8,
    title: "Growth Marketer",
    company: "MarketSphere",
    companyLogo: "MS",
    companyColor: "from-orange-500 to-orange-600",
    description:
      "Drive user acquisition and retention through experimentation. Growth mindset and data fluency required.",
    salary: "$75k - $100k",
    location: "Miami, FL",
    jobType: "Full-time",
    category: "Marketing",
    postedAt: "2 days ago",
    clientId: 4,
  },
  {
    id: 9,
    title: "Civil Engineer",
    company: "BuildRight",
    companyLogo: "BR",
    companyColor: "from-indigo-500 to-indigo-600",
    description:
      "Lead infrastructure projects from design through construction. Coordinate with contractors and clients.",
    salary: "$95k - $130k",
    location: "Denver, CO",
    jobType: "Full-time",
    category: "Engineering",
    postedAt: "7 days ago",
    clientId: 5,
  },
  {
    id: 10,
    title: "Registered Nurse",
    company: "HealthPlus",
    companyLogo: "HP",
    companyColor: "from-teal-500 to-teal-600",
    description:
      "Provide compassionate patient care in a hospital setting. Work with a supportive multidisciplinary team.",
    salary: "$80k - $110k",
    location: "Boston, MA",
    jobType: "Full-time",
    category: "Healthcare",
    postedAt: "3 days ago",
    clientId: 6,
  },
  {
    id: 11,
    title: "Software Engineer Intern",
    company: "TechNova",
    companyLogo: "TN",
    companyColor: "from-blue-500 to-blue-600",
    description:
      "Hands-on internship working on real production features. Great mentorship and growth path.",
    salary: "$30k - $45k",
    location: "Remote",
    jobType: "Internship",
    category: "Technology",
    postedAt: "1 day ago",
    clientId: 1,
  },
  {
    id: 12,
    title: "Sales Manager",
    company: "MarketSphere",
    companyLogo: "MS",
    companyColor: "from-orange-500 to-orange-600",
    description:
      "Lead a sales team and drive revenue growth. Build pipelines and close enterprise deals.",
    salary: "$85k - $120k",
    location: "Seattle, WA",
    jobType: "Full-time",
    category: "Sales",
    postedAt: "4 days ago",
    clientId: 4,
  },
];

export const CAREER_TIPS: CareerTip[] = [
  {
    id: 1,
    title: "Craft a Resume That Gets Noticed",
    category: "Resume",
    readTime: "5 min read",
    excerpt:
      "Learn how to structure your resume to pass ATS filters and capture a recruiter's attention in the first 6 seconds.",
    content: [
      "Your resume is your first impression. Use a clean, single-column layout and lead with a strong professional summary.",
      "Tailor every resume to the specific role. Mirror the keywords from the job description to pass Applicant Tracking Systems.",
      "Quantify your achievements with numbers — 'increased sales by 30%' is far more compelling than 'responsible for sales'.",
      "Keep it to one page for most roles, and always proofread twice. A single typo can cost you an interview.",
    ],
  },
  {
    id: 2,
    title: "Acing the Interview: Preparation & Follow-Up",
    category: "Interview",
    readTime: "7 min read",
    excerpt:
      "Master the STAR method, ask the right questions, and stand out with a thoughtful thank-you note.",
    content: [
      "Research the company thoroughly — their products, culture, recent news, and competitors.",
      "Prepare stories using the STAR method (Situation, Task, Action, Result) to answer behavioral questions.",
      "Always have 3–5 thoughtful questions ready to ask your interviewer. It shows genuine interest.",
      "Send a personalized thank-you note within 24 hours, referencing something specific from the conversation.",
    ],
  },
  {
    id: 3,
    title: "Negotiating Your Salary with Confidence",
    category: "Salary",
    readTime: "6 min read",
    excerpt:
      "Know your worth, frame the conversation, and secure a better offer without damaging the relationship.",
    content: [
      "Research market rates for your role and location using reliable salary data before negotiating.",
      "Never give the first number. Let the employer state their range, then anchor your ask with data.",
      "Consider the full compensation package — base, bonus, equity, benefits, and flexibility — not just salary.",
      "Negotiate professionally and gracefully. You're more likely to succeed when it feels collaborative, not confrontational.",
    ],
  },
  {
    id: 4,
    title: "Building Your Personal Brand Online",
    category: "Career Growth",
    readTime: "8 min read",
    excerpt:
      "Optimize your LinkedIn, showcase your work, and make recruiters come to you.",
    content: [
      "Your LinkedIn profile should tell a clear story: a strong headline, a professional photo, and a compelling summary.",
      "Share your work publicly — portfolio projects, blog posts, and contributions to open source.",
      "Engage meaningfully in your field by commenting thoughtfully and sharing insights from your experience.",
      "Consistency beats intensity. A small, steady presence over months outperforms a frantic push.",
    ],
  },
  {
    id: 5,
    title: "Job Searching Efficiently: A System That Works",
    category: "Job Search",
    readTime: "6 min read",
    excerpt:
      "Stop spray-and-pray applications. Build a targeted, organized job search that yields real interviews.",
    content: [
      "Set a daily goal: a specific number of quality applications, tailored, rather than a high volume of generic ones.",
      "Track every application in a simple spreadsheet — role, company, date, status, and follow-up reminders.",
      "Apply to roles where you meet 60–80% of the requirements. Don't let doubt rule you out.",
      "Follow up after one week if you haven't heard back. A polite nudge shows initiative and keeps you top-of-mind.",
    ],
  },
  {
    id: 6,
    title: "Upskilling to Future-Proof Your Career",
    category: "Career Growth",
    readTime: "9 min read",
    excerpt:
      "Identify in-demand skills, choose the right learning path, and showcase your new abilities to employers.",
    content: [
      "Look at job postings in your field to identify the skills employers are hiring for most.",
      "Pick one high-value skill to focus on at a time, and get hands-on with real projects rather than just watching courses.",
      "Earn certifications that are recognized in your industry, and add them to your resume and LinkedIn.",
      "Communicate your learning journey — showing growth mindset is itself a highly valued trait.",
    ],
  },
];

// Client-side auth simulation. In the backend phase this will be replaced by
// JWT/email-password auth. `loggedInClientId` is the company account that owns
// the current session.
export const loggedInClientId = 1;

export function getJobById(id: number): JobPost | undefined {
  return JOBS.find((job) => job.id === id);
}

export function filterJobs(params: {
  keyword?: string;
  category?: string;
  location?: string;
  salary?: string;
}): JobPost[] {
  const { keyword, category, location, salary } = params;
  return JOBS.filter((job) => {
    if (keyword) {
      const kw = keyword.toLowerCase();
      const haystack = `${job.title} ${job.company} ${job.category} ${job.description}`.toLowerCase();
      if (!haystack.includes(kw)) return false;
    }
    if (category && category !== "all" && job.category !== category) return false;
    if (location && location !== "all" && job.location !== location) return false;
    if (salary && salary !== "all") {
      const min = parseInt(salary.replace("$", ""), 10);
      const match = job.salary.match(/\$(\d+)k\s*-\s*\$(\d+)k/i);
      if (match) {
        const low = parseInt(match[1], 10);
        const high = parseInt(match[2], 10);
        if (high < min) return false;
      }
    }
    return true;
  });
}
