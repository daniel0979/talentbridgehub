import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import MaintenanceScreen from "./components/MaintenanceScreen";
import { ThemeProvider } from "./contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Companies from "./pages/Companies";
import CareerTips from "./pages/CareerTips";
import ClientLogin from "./pages/ClientLogin";
import ClientSignup from "./pages/ClientSignup";
import ClientDashboard from "./pages/ClientDashboard";
import JobPostings from "./pages/JobPostings";
import CompanyProfile from "./pages/CompanyProfile";
import ClientReviews from "./pages/ClientReviews";
import CompanyLayout from "./components/CompanyLayout";
import CompanyApplicants from "./pages/CompanyApplicants";
import JobSeekerProfile from "./pages/JobSeekerProfile";
import JobSeekerDashboard from "./pages/JobSeekerDashboard";
import AppliedCompanies from "./pages/AppliedCompanies";
import AdminRoutes from "./admin/AdminRoutes";
import { useSecretAdminShortcut } from "./hooks/useSecretAdminShortcut";

function Router() {
  useSecretAdminShortcut();
  const [location] = useLocation();
  const maintenanceQuery = trpc.system.maintenance.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  // When maintenance mode is on, block the public site (all non-admin routes)
  // with a maintenance screen showing the admin's message. The admin portal
  // (anything under /admin) must remain accessible so admins can reopen.
  const isAdminRoute = location === "/admin" || location.startsWith("/admin");
  const maintenance = maintenanceQuery.data;

  if (maintenance?.enabled && !isAdminRoute) {
    return <MaintenanceScreen message={maintenance.message} />;
  }

  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/admin/:rest*"} component={AdminRoutes} />
      <Route path={"/"} component={Home} />
      <Route path={"/about"} component={About} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/privacy-policy"} component={PrivacyPolicy} />
      <Route path={"/jobs"} component={Jobs} />
      <Route path={"/jobs/:id"} component={JobDetail} />
      <Route path={"/companies"} component={Companies} />
      <Route path={"/tips"} component={CareerTips} />
      <Route path={"/client/login"} component={ClientLogin} />
      <Route path={"/client/signup"} component={ClientSignup} />
      <Route path={"/client/dashboard"}>
        <CompanyLayout>
          <ClientDashboard />
        </CompanyLayout>
      </Route>
      <Route path={"/client/dashboard/jobs"}>
        <CompanyLayout>
          <JobPostings />
        </CompanyLayout>
      </Route>
      <Route path={"/client/dashboard/profile"}>
        <CompanyLayout>
          <CompanyProfile />
        </CompanyLayout>
      </Route>
<Route path={"/client/dashboard/reviews"}>
        <CompanyLayout>
          <ClientReviews />
        </CompanyLayout>
      </Route>
      <Route path={"/client/dashboard/applicants"}>
        <CompanyLayout>
          <CompanyApplicants />
        </CompanyLayout>
      </Route>
<Route path={"/profile"} component={JobSeekerProfile} />
      <Route path={"/dashboard"} component={JobSeekerDashboard} />
      <Route path={"/profile/applications"} component={AppliedCompanies} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
