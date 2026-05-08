import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Keep LandingPage eager loaded for fastest initial render
import { LandingPage } from "./components/LandingPage";

// Lazy load all other pages to improve initial load time
const LoginPage = lazy(() => import("./components/auth/LoginPage").then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("./components/auth/RegisterPage").then(m => ({ default: m.RegisterPage })));
const RegisterSuccessPage = lazy(() => import("./components/auth/RegisterSuccessPage").then(m => ({ default: m.RegisterSuccessPage })));
const ForgotPasswordPage = lazy(() => import("./components/auth/ForgotPasswordPage").then(m => ({ default: m.ForgotPasswordPage })));
const DonationPage = lazy(() => import("./components/donation/DonationPage").then(m => ({ default: m.DonationPage })));
const DonationSuccessPage = lazy(() => import("./components/donation/DonationSuccessPage").then(m => ({ default: m.DonationSuccessPage })));
const DonationFailurePage = lazy(() => import("./components/donation/DonationFailurePage").then(m => ({ default: m.DonationFailurePage })));

// Dashboards
const DashboardLayout = lazy(() => import("./components/dashboard/DashboardLayout").then(m => ({ default: m.DashboardLayout })));
const DashboardPage = lazy(() => import("./components/dashboard/DashboardPage").then(m => ({ default: m.DashboardPage })));
const MyDonationsPage = lazy(() => import("./components/dashboard/MyDonationsPage").then(m => ({ default: m.MyDonationsPage })));
const AiAnalysisPage = lazy(() => import("./components/dashboard/AiAnalysisPage").then(m => ({ default: m.AiAnalysisPage })));
const UrgentRequestsPage = lazy(() => import("./components/dashboard/UrgentRequestsPage").then(m => ({ default: m.UrgentRequestsPage })));
const ApplicationsPage = lazy(() => import("./components/dashboard/ApplicationsPage").then(m => ({ default: m.ApplicationsPage })));
const LeaderboardPage = lazy(() => import("./components/dashboard/LeaderboardPage").then(m => ({ default: m.LeaderboardPage })));
const ImpactTrackerPage = lazy(() => import("./components/dashboard/ImpactTrackerPage").then(m => ({ default: m.ImpactTrackerPage })));
const BadgesViewAllPage = lazy(() => import("./components/dashboard/BadgesViewAllPage").then(m => ({ default: m.BadgesViewAllPage })));
const ProfileSettingsPage = lazy(() => import("./components/dashboard/ProfileSettingsPage").then(m => ({ default: m.ProfileSettingsPage })));

// Admin
const AdminLayout = lazy(() => import("./components/admin/AdminLayout").then(m => ({ default: m.AdminLayout })));
const AdminDashboardPage = lazy(() => import("./components/admin/AdminDashboardPage").then(m => ({ default: m.AdminDashboardPage })));
const AdminFinancePage = lazy(() => import("./components/admin/AdminFinancePage").then(m => ({ default: m.AdminFinancePage })));
const AdminDonorsPage = lazy(() => import("./components/admin/AdminDonorsPage").then(m => ({ default: m.AdminDonorsPage })));
const AdminCampaignsPage = lazy(() => import("./components/admin/AdminCampaignsPage").then(m => ({ default: m.AdminCampaignsPage })));
const AdminTeamPage = lazy(() => import("./components/admin/AdminTeamPage").then(m => ({ default: m.AdminTeamPage })));
const AdminSettingsPage = lazy(() => import("./components/admin/AdminSettingsPage").then(m => ({ default: m.AdminSettingsPage })));
const OrgClothingPage = lazy(() => import("./components/admin/OrgClothingPage").then(m => ({ default: m.OrgClothingPage })));
const OrgReceivedDonationsPage = lazy(() => import("./components/admin/OrgReceivedDonationsPage").then(m => ({ default: m.OrgReceivedDonationsPage })));

// Public Pages
const ContactPage = lazy(() => import("./components/public/ContactPage").then(m => ({ default: m.ContactPage })));
const VolunteerPage = lazy(() => import("./components/public/VolunteerPage").then(m => ({ default: m.VolunteerPage })));
const AllCampaignsPage = lazy(() => import("./components/public/AllCampaignsPage").then(m => ({ default: m.AllCampaignsPage })));
const CampaignDetailsPage = lazy(() => import("./components/public/CampaignDetailsPage").then(m => ({ default: m.CampaignDetailsPage })));
const AboutPage = lazy(() => import("./components/public/AboutPage").then(m => ({ default: m.AboutPage })));
const PrivacyPolicyPage = lazy(() => import("./components/public/LegalPages").then(m => ({ default: m.PrivacyPolicyPage })));
const TermsPage = lazy(() => import("./components/public/LegalPages").then(m => ({ default: m.TermsPage })));
const NotFoundPage = lazy(() => import("./components/NotFoundPage").then(m => ({ default: m.NotFoundPage })));
const PartnersPage = lazy(() => import("./components/public/PartnersPage").then(m => ({ default: m.PartnersPage })));
const AccessibilityPage = lazy(() => import("./components/public/AccessibilityPage").then(m => ({ default: m.AccessibilityPage })));

// Platform Admin
const PlatformAdminLayout = lazy(() => import("./components/platform-admin/PlatformAdminLayout").then(m => ({ default: m.PlatformAdminLayout })));
const PlatformAdminDashboard = lazy(() => import("./components/platform-admin/PlatformAdminDashboard").then(m => ({ default: m.PlatformAdminDashboard })));
const PlatformAdminCampaigns = lazy(() => import("./components/platform-admin/PlatformAdminCampaigns").then(m => ({ default: m.PlatformAdminCampaigns })));
const PlatformAdminOrganizations = lazy(() => import("./components/platform-admin/PlatformAdminOrganizations").then(m => ({ default: m.PlatformAdminOrganizations })));
const PlatformAdminUsers = lazy(() => import("./components/platform-admin/PlatformAdminUsers").then(m => ({ default: m.PlatformAdminUsers })));

// A simple loading fallback
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-50/50">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register-success" element={<RegisterSuccessPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/donate" element={<DonationPage />} />
          <Route path="/donate/success" element={<DonationSuccessPage />} />
          <Route path="/donate/failure" element={<DonationFailurePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/volunteer" element={<VolunteerPage />} />
          <Route path="/campaigns" element={<AllCampaignsPage />} />
          <Route path="/campaigns/:id" element={<CampaignDetailsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/accessibility" element={<AccessibilityPage />} />

          <Route path="/user" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="donations" element={<MyDonationsPage />} />
            <Route path="analysis" element={<AiAnalysisPage />} />
            <Route path="urgent" element={<UrgentRequestsPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="impact" element={<ImpactTrackerPage />} />
            <Route path="impact/badges" element={<BadgesViewAllPage />} />
            <Route path="profile" element={<ProfileSettingsPage />} />
          </Route>

          {/* Organization Dashboard (was /admin, now /org) */}
          <Route path="/org" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="finance" element={<AdminFinancePage />} />
            <Route path="donors" element={<AdminDonorsPage />} />
            <Route path="campaigns" element={<AdminCampaignsPage />} />
            <Route path="team" element={<AdminTeamPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="clothes" element={<OrgClothingPage />} />
            <Route path="received" element={<OrgReceivedDonationsPage />} />
          </Route>

          {/* Platform Admin Panel */}
          <Route path="/admin" element={<PlatformAdminLayout />}>
            <Route index element={<PlatformAdminDashboard />} />
            <Route path="campaigns" element={<PlatformAdminCampaigns />} />
            <Route path="organizations" element={<PlatformAdminOrganizations />} />
            <Route path="users" element={<PlatformAdminUsers />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
