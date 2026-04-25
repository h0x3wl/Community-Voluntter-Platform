import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/auth/LoginPage";
import { RegisterPage } from "./components/auth/RegisterPage";
import { RegisterSuccessPage } from "./components/auth/RegisterSuccessPage";
import { ForgotPasswordPage } from "./components/auth/ForgotPasswordPage";
import { DonationPage } from "./components/donation/DonationPage";
import { DonationSuccessPage } from "./components/donation/DonationSuccessPage";
import { DonationFailurePage } from "./components/donation/DonationFailurePage";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { DashboardPage } from "./components/dashboard/DashboardPage";
import { MyDonationsPage } from "./components/dashboard/MyDonationsPage";
import { AiAnalysisPage } from "./components/dashboard/AiAnalysisPage";
import { UrgentRequestsPage } from "./components/dashboard/UrgentRequestsPage";
import { ApplicationsPage } from "./components/dashboard/ApplicationsPage";
import { LeaderboardPage } from "./components/dashboard/LeaderboardPage";
import { ImpactTrackerPage } from "./components/dashboard/ImpactTrackerPage";
import { BadgesViewAllPage } from "./components/dashboard/BadgesViewAllPage";
import { ProfileSettingsPage } from "./components/dashboard/ProfileSettingsPage";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminDashboardPage } from "./components/admin/AdminDashboardPage";
import { AdminFinancePage } from "./components/admin/AdminFinancePage";
import { AdminDonorsPage } from "./components/admin/AdminDonorsPage";
import { AdminCampaignsPage } from "./components/admin/AdminCampaignsPage";
import { AdminTeamPage } from "./components/admin/AdminTeamPage";
import { AdminSettingsPage } from "./components/admin/AdminSettingsPage"
import { OrgClothingPage } from "./components/admin/OrgClothingPage";
import { ContactPage } from "./components/public/ContactPage";
import { VolunteerPage } from "./components/public/VolunteerPage";
import { AllCampaignsPage } from "./components/public/AllCampaignsPage";
import { CampaignDetailsPage } from "./components/public/CampaignDetailsPage";
import { AboutPage } from "./components/public/AboutPage";
import { PrivacyPolicyPage, TermsPage } from "./components/public/LegalPages";
import { NotFoundPage } from "./components/NotFoundPage";

// New Pages
import { PartnersPage } from "./components/public/PartnersPage";
import { AccessibilityPage } from "./components/public/AccessibilityPage";

// Platform Admin
import { PlatformAdminLayout } from "./components/platform-admin/PlatformAdminLayout";
import { PlatformAdminDashboard } from "./components/platform-admin/PlatformAdminDashboard";
import { PlatformAdminCampaigns } from "./components/platform-admin/PlatformAdminCampaigns";
import { PlatformAdminOrganizations } from "./components/platform-admin/PlatformAdminOrganizations";
import { PlatformAdminUsers } from "./components/platform-admin/PlatformAdminUsers";

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;
