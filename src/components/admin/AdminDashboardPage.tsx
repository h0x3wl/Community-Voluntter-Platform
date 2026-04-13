import { Button } from "../ui/button"
import {
    Calendar,
    Plus,
    TrendingUp,
    Users,
    Flag,
    DollarSign,
    ArrowRight
} from "lucide-react"

import { Link } from "react-router-dom"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useCurrentUser } from "../../hooks/useCurrentUser";

export function AdminDashboardPage() {
    const { orgId } = useCurrentUser();
    const [overview, setOverview] = useState<any>(null);
    const [finance, setFinance] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!orgId) return;
        const fetchDashboardData = async () => {
            try {
                const [overviewRes, financeRes] = await Promise.all([
                    api.getOrgOverview(orgId).catch(() => null),
                    api.getOrgFinance(orgId).catch(() => null)
                ]);
                if (overviewRes?.data) setOverview(overviewRes.data);
                if (financeRes?.data) setFinance(financeRes.data);
            } catch (err) {
                console.error("Failed to fetch org dashboard data", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, [orgId]);

    const totalDonations = (finance?.total_raised_cents || overview?.funds_raised_month || 0) / 100;
    const activeCampaigns = overview?.total_active_campaigns || 0;
    const activeDonors = overview?.active_donors || 0;
    const growthPercent = overview?.funds_delta_percent != null ? Math.round(overview.funds_delta_percent) : 0;

    const chartData = finance?.monthly_totals?.map((m: any) => ({
        name: m.month,
        amount: m.amount_cents / 100
    })) || [];

    const topCampaigns = finance?.top_campaigns || [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <span className="text-gray-500 font-medium">Loading Overview...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-500 mt-1">Welcome back, Admin. Here is what is happening today.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="bg-white border-gray-200 text-gray-700">
                        <Calendar className="w-4 h-4 mr-2" />
                        This Month
                    </Button>
                    <Link to="/org/campaigns">
                        <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                            <Plus className="w-4 h-4 mr-2" />
                            New Campaign
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1: Donations */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div className="bg-green-50 px-2 py-1 rounded-lg flex items-center text-xs font-bold text-green-700 gap-1">
                            <TrendingUp className="w-3 h-3" /> {growthPercent > 0 ? '+' : ''}{growthPercent}%
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Donations</p>
                        <h3 className="text-2xl font-bold text-gray-900">${totalDonations.toLocaleString()}</h3>
                    </div>
                </div>

                {/* Card 2: Active Campaigns */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <Flag className="w-5 h-5" />
                        </div>
                        <div className="bg-gray-100 px-2 py-1 rounded-lg flex items-center text-xs font-bold text-gray-600 gap-1">
                            Live
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Active Campaigns</p>
                        <h3 className="text-2xl font-bold text-gray-900">{activeCampaigns}</h3>
                    </div>
                </div>

                {/* Card 3: New Donors */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <div className="bg-green-50 px-2 py-1 rounded-lg flex items-center text-xs font-bold text-green-700 gap-1">
                            <TrendingUp className="w-3 h-3" /> Growth
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Active Donors</p>
                        <h3 className="text-2xl font-bold text-gray-900">{activeDonors.toLocaleString()}</h3>
                    </div>
                </div>

                {/* Card 4: Monthly Growth */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div className="bg-green-50 px-2 py-1 rounded-lg flex items-center text-xs font-bold text-green-700 gap-1">
                            <TrendingUp className="w-3 h-3" /> Target
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Monthly Growth</p>
                        <h3 className="text-2xl font-bold text-gray-900">{growthPercent}%</h3>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Charts (Placeholder & Top Campaigns) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Chart Implementation */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-96 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-gray-900">Donation Trends</h3>
                                <p className="text-xs text-gray-500">Last 12 Months</p>
                            </div>
                            <div>
                                <h3 className="text-right font-bold text-xl text-gray-900">${totalDonations.toLocaleString()}</h3>
                                <p className="text-xs text-green-600 font-bold text-right">+{growthPercent}% vs last month</p>
                            </div>
                        </div>

                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={chartData}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: 0,
                                        bottom: 0,
                                    }}
                                >
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#111827', fontWeight: 600 }}
                                        formatter={(value) => [`$${value}`, 'Amount']}
                                        cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorAmount)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Campaigns List */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900">Top Campaigns</h3>
                            <Link to="/org/campaigns" className="text-xs font-bold text-blue-600 hover:text-blue-700">View All</Link>
                        </div>

                        <div className="space-y-6">
                            {topCampaigns.length === 0 && (
                                <div className="py-8 text-center text-gray-400 text-sm">
                                    No campaigns yet. Create your first campaign to get started!
                                </div>
                            )}
                            {topCampaigns.map((camp: any, i: number) => {
                                const raised = (camp.raised_cents || 0) / 100;
                                const goal = (camp.goal_cents || 1) / 100;
                                const progress = Math.min((raised / goal) * 100, 100);

                                return (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex-shrink-0 overflow-hidden flex items-center justify-center font-bold text-blue-500">
                                                    {camp.title?.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-gray-900">{camp.title}</h4>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${camp.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                        {camp.status || 'active'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">Goal: ${goal.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full ${camp.status === 'completed' ? 'bg-blue-500' : 'bg-green-500'}`} style={{ width: `${progress}%` }} />
                                        </div>
                                        <p className="text-xs text-gray-500">Raised: <span className="font-bold text-gray-900">${raised.toLocaleString()}</span></p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                </div>

                {/* Right: Goal & Quick Actions */}
                <div className="space-y-6">

                    {/* Annual Goal Card */}
                    <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/30 flex flex-col justify-between h-80 relative overflow-hidden">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="relative z-10">
                            <p className="text-blue-100 text-sm font-medium mb-1">Annual Goal</p>
                            <h3 className="text-4xl font-bold">85%</h3>
                            <p className="text-xs text-blue-200 mt-1">Progress towards $1M</p>
                        </div>

                        <div className="relative z-10 mt-auto">
                            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-4">
                                <div className="h-full bg-white w-[85%]" />
                            </div>
                            <p className="text-xs text-blue-100 leading-relaxed opacity-80">
                                Excellent progress! You are on track to exceed your annual fundraising goal by end of Q4.
                            </p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link to="/org/donors">
                                <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700 group">
                                    View All Donors
                                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                                </button>
                            </Link>
                            <Link to="/org/finance">
                                <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700 group">
                                    Finance Reports
                                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                                </button>
                            </Link>
                            <Link to="/org/team">
                                <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700 group">
                                    Manage Team
                                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                                </button>
                            </Link>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    )
}
