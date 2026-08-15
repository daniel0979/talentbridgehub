import AdminLogin from "./AdminLogin";
import AdminLayout from "./AdminLayout";
import Dashboard from "./Dashboard";
import JobSeekers from "./JobSeekers";
import Companies from "./Companies";
import JobPostings from "./JobPostings";
import CareerTips from "./CareerTips";
import Partners from "./Partners";
import CategoriesLocations from "./CategoriesLocations";
import AdminUsers from "./AdminUsers";
import ActivityLog from "./ActivityLog";
import Settings from "./Settings";
import Applications from "./Applications";
import Notifications from "./Notifications";
import { Route, Switch } from "wouter";

/**
 * Isolated Admin portal routes. Everything under /admin is wrapped in the
 * AdminLayout (auth-gated, role-aware sidebar). The login page sits outside
 * the layout since the admin isn't authenticated yet.
 */
export default function AdminRoutes() {
  return (
    <Switch>
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard">
        <AdminLayout>
          <Dashboard />
        </AdminLayout>
      </Route>
<Route path="/admin/job-seekers">
        <AdminLayout>
          <JobSeekers />
        </AdminLayout>
      </Route>
      <Route path="/admin/companies">
        <AdminLayout>
          <Companies />
        </AdminLayout>
      </Route>
<Route path="/admin/job-postings">
        <AdminLayout>
          <JobPostings />
        </AdminLayout>
      </Route>
{/* Placeholder pages for Phase 2/3 — to be implemented next. */}
      <Route path="/admin/career-tips">
        <AdminLayout>
          <CareerTips />
        </AdminLayout>
      </Route>
<Route path="/admin/partners">
        <AdminLayout>
          <Partners />
        </AdminLayout>
      </Route>
<Route path="/admin/categories">
        <AdminLayout>
          <CategoriesLocations />
        </AdminLayout>
      </Route>
      <Route path="/admin/admin-users">
        <AdminLayout>
          <AdminUsers />
        </AdminLayout>
      </Route>
<Route path="/admin/activity-log">
        <AdminLayout>
          <ActivityLog />
        </AdminLayout>
      </Route>
      <Route path="/admin/applications">
        <AdminLayout>
          <Applications />
        </AdminLayout>
      </Route>
      <Route path="/admin/notifications">
        <AdminLayout>
          <Notifications />
        </AdminLayout>
      </Route>
      <Route path="/admin/settings">
        <AdminLayout>
          <Settings />
        </AdminLayout>
      </Route>
      <Route>
        <AdminLayout>
          <Placeholder title="Not Found" />
        </AdminLayout>
      </Route>
    </Switch>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">{title}</h1>
      <p className="text-muted-foreground">
        This page will be implemented in the next phase.
      </p>
    </div>
  );
}
