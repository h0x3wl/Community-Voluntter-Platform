/**
 * A central fetch wrapper for the Laravel Backend API.
 * Uses the proxy set up in vite.config.ts (/api/v1).
 */
const API_BASE_URL = '/api/v1';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  // Automatically retrieve the stored token if the user is authenticated
  const token = localStorage.getItem('token');
  
  const headers = new Headers(options.headers || {});
  
  // Set default JSON headers, unless we're sending FormData (like file uploads)
  headers.set('Accept', 'application/json');
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Attach auth token if available
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Try parsing the JSON response safely
  let data;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  // Handle HTTP errors mapping them to Javascript Errors
  if (!response.ok) {
    // According to the backend docs, error messages are usually in data.message
    const errorMsg = data?.data?.message || data?.message || `HTTP error! Status: ${response.status}`;
    const error = new Error(errorMsg);
    // Attach backend validation errors if they exist
    (error as any).errors = data?.data?.errors;
    throw error;
  }

  return data;
}

// Example Helper functions based on backend endpoints (from docs/api.md)

export const api = {
  // --- Auth ---
  login: (credentials: Record<string, string>) => 
    fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    
  register: (userData: Record<string, string>) => 
    fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    
  logout: () => fetchApi('/auth/logout', { method: 'POST' }),

  forgotPassword: (email: string) => 
    fetchApi('/auth/password/forgot', { method: 'POST', body: JSON.stringify({ email }) }),
  
  // --- User ---
  getMe: () => fetchApi('/me', { method: 'GET' }),
  updateMe: (data: any) => fetchApi('/me', { method: 'PUT', body: JSON.stringify(data) }),
  updateMePassword: (data: any) => fetchApi('/me/password', { method: 'PUT', body: JSON.stringify(data) }),
  getImpactTracker: (month: string) => fetchApi(`/me/impact?month=${month}`, { method: 'GET' }),
  getMyDonations: () => fetchApi('/me/donations', { method: 'GET' }),
  getMyApplications: () => fetchApi('/me/applications', { method: 'GET' }),
  getNotifications: () => fetchApi('/me/notifications', { method: 'GET' }),
  markNotificationsRead: (id?: string) => fetchApi(id ? `/me/notifications/${id}/read` : '/me/notifications/read', { method: 'PUT' }),
  
  // --- Leaderboard & Badges ---
  getLeaderboard: (range: string) => fetchApi(`/leaderboard?range=${range}`, { method: 'GET' }),
  getBadges: () => fetchApi('/badges', { method: 'GET' }),
  
  // --- Campaigns ---
  getCampaigns: () => fetchApi('/campaigns', { method: 'GET' }),
  getCampaignDetails: (slug: string) => fetchApi(`/campaigns/${slug}`, { method: 'GET' }),

  // --- Donations ---
  createDonationIntent: (data: any) => fetchApi('/donations/intent', { method: 'POST', body: JSON.stringify(data) }),
  simulateDonation: (data: any) => fetchApi('/donations/simulate', { method: 'POST', body: JSON.stringify(data) }),
  getDonation: (publicId: string) => fetchApi(`/donations/${publicId}`, { method: 'GET' }),

  // --- Opportunities ---
  getOpportunities: () => fetchApi('/opportunities', { method: 'GET' }),
  getOpportunityDetails: (id: string) => fetchApi(`/opportunities/${id}`, { method: 'GET' }),
  applyToOpportunity: (id: string, data: any) => fetchApi(`/opportunities/${id}/apply`, { method: 'POST', body: JSON.stringify(data) }),

  // --- Contact & Newsletter ---
  submitContactForm: (data: any) => fetchApi('/contact', { method: 'POST', body: JSON.stringify(data) }),
  subscribeNewsletter: (email: string) => fetchApi('/newsletter', { method: 'POST', body: JSON.stringify({ email }) }),

  // --- Organization ---
  createOrganization: (data: any) => fetchApi('/orgs', { method: 'POST', body: JSON.stringify(data) }),
  getOrg: (orgId: string) => fetchApi(`/orgs/${orgId}`, { method: 'GET' }),
  updateOrg: (orgId: string, data: any) => fetchApi(`/orgs/${orgId}`, { method: 'PUT', body: JSON.stringify(data) }),
  uploadOrgLogo: (orgId: string, formData: FormData) => fetchApi(`/orgs/${orgId}/logo`, { method: 'POST', body: formData }),

  // --- Organization Admin ---
  getOrgOverview: (orgId: string) => fetchApi(`/orgs/${orgId}/dashboard/overview`, { method: 'GET' }),
  getOrgFinance: (orgId: string) => fetchApi(`/orgs/${orgId}/dashboard/finance`, { method: 'GET' }),
  getOrgDonors: (orgId: string) => fetchApi(`/orgs/${orgId}/dashboard/donors`, { method: 'GET' }),
  getOrgCampaigns: (orgId: string) => fetchApi(`/orgs/${orgId}/campaigns`, { method: 'GET' }),
  createOrgCampaign: (orgId: string, data: any) => fetchApi(`/orgs/${orgId}/campaigns`, { method: 'POST', body: JSON.stringify(data) }),
  updateOrgCampaign: (orgId: string, campaignId: string, data: any) => fetchApi(`/orgs/${orgId}/campaigns/${campaignId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteOrgCampaign: (orgId: string, campaignId: string) => fetchApi(`/orgs/${orgId}/campaigns/${campaignId}`, { method: 'DELETE' }),
  uploadCampaignImage: (orgId: string, campaignId: string, formData: FormData) => fetchApi(`/orgs/${orgId}/campaigns/${campaignId}/images`, { method: 'POST', body: formData }),
  getOrgTeam: (orgId: string) => fetchApi(`/orgs/${orgId}/members`, { method: 'GET' }),

  // --- Platform Admin ---
  getAdminCampaigns: (params?: string) => fetchApi(`/admin/campaigns${params ? '?' + params : ''}`, { method: 'GET' }),
  updateAdminCampaign: (id: string, data: any) => fetchApi(`/admin/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  approveAdminCampaign: (id: string) => fetchApi(`/admin/campaigns/${id}/approve`, { method: 'POST' }),
  rejectAdminCampaign: (id: string) => fetchApi(`/admin/campaigns/${id}/reject`, { method: 'POST' }),
  deleteAdminCampaign: (id: string) => fetchApi(`/admin/campaigns/${id}`, { method: 'DELETE' }),

  getAdminOrganizations: (params?: string) => fetchApi(`/admin/organizations${params ? '?' + params : ''}`, { method: 'GET' }),
  updateAdminOrganization: (id: string, data: any) => fetchApi(`/admin/organizations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminOrganization: (id: string) => fetchApi(`/admin/organizations/${id}`, { method: 'DELETE' }),

  getAdminUsers: (params?: string) => fetchApi(`/admin/users${params ? '?' + params : ''}`, { method: 'GET' }),
  deleteAdminUser: (id: string) => fetchApi(`/admin/users/${id}`, { method: 'DELETE' }),
};
