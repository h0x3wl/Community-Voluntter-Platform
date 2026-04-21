import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import {
    Download,
    TrendingUp,
    Users,
    CreditCard,
    DollarSign,
    Filter,
    ChevronDown,
    MoreHorizontal
} from "lucide-react"
import { api } from "../../lib/api"
import { useCurrentUser } from "../../hooks/useCurrentUser"

export function AdminFinancePage() {
    const { orgId } = useCurrentUser()
    const [timeRange, setTimeRange] = useState("30days")
    const [finance, setFinance] = useState<any>(null)
    const [donors, setDonors] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchFinance = async () => {
            try {
                const [finRes, donRes] = await Promise.all([
                    api.getOrgFinance(orgId).catch(() => null),
                    api.getOrgDonors(orgId).catch(() => null),
                ])
                if (finRes?.data) setFinance(finRes.data)
                if (donRes?.data) setDonors(donRes.data)
            } catch (err) {
                console.error("Failed to fetch finance data", err)
            } finally {
                setIsLoading(false)
            }
        }
        if (orgId) fetchFinance()
    }, [orgId])

    // Derive stats from API data with safe fallbacks
    const totalRevenue = finance?.monthly_totals
        ? finance.monthly_totals.reduce((acc: number, m: any) => acc + (m.amount_cents || 0), 0) / 100
        : 0
    const totalDonors = donors?.total_count || 0
    const totalAmountCents = donors?.total_amount_cents || 0
    const avgDonation = totalDonors > 0 ? (totalAmountCents / 100) / totalDonors : 0
    const monthlyData = finance?.monthly_totals || []
    const topCampaigns = finance?.top_campaigns || []

    // Build chart bars from real data
    const generateEmptyMonths = () => {
        const months = []
        for (let i = 2; i >= 0; i--) {
            const d = new Date()
            d.setMonth(d.getMonth() - i)
            months.push({ m: d.toLocaleString('default', { month: 'short' }), amount: 0 })
        }
        return months
    }

    const chartBars = monthlyData.length > 0
        ? monthlyData.map((m: any) => ({
            m: m.month || "—",
            amount: (m.amount_cents || 0) / 100,
        }))
        : generateEmptyMonths()

    const maxAmount = Math.max(...chartBars.map((b: any) => b.amount), 1)

    // Build transactions from recent donors
    const transactions = donors?.recent_donors?.slice(0, 6)?.map((d: any, i: number) => ({
        id: `#TRX-${1000 + i}`,
        name: d.donor_name || "Anonymous",
        date: d.last_donated_at ? new Date(d.last_donated_at).toLocaleDateString() : "—",
        campaign: d.campaign || "General",
        amount: (d.total_cents || 0) / 100,
        status: "Success",
    })) || []

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <span className="text-gray-500 font-medium">Loading finance data...</span>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Finance & Revenue</h1>
                    <p className="text-gray-500 mt-1">Financial tracking and donation analytics for your organization.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="bg-white border-gray-200 text-gray-700"
                        onClick={() => alert("Generating Financial Report...")}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Time Range Tabs */}
            <div className="border-b border-gray-200">
                <div className="flex gap-6">
                    {["all", "30days", "7days"].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`pb-3 border-b-2 text-sm font-medium transition-colors ${
                                timeRange === range
                                    ? "border-blue-600 text-blue-600 font-bold"
                                    : "border-transparent text-gray-500 hover:text-gray-900"
                            }`}
                        >
                            {range === "all" ? "All Time" : range === "30days" ? "Last 30 Days" : "Last 7 Days"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-500">Total Revenue</span>
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                            <DollarSign className="w-4 h-4" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-green-600 flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3" /> From API
                        </span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-500">Top Campaign</span>
                        <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
                        {topCampaigns[0]?.title || "—"}
                    </h3>
                    <p className="text-xs text-gray-400">
                        ${((topCampaigns[0]?.raised_cents || 0) / 100).toLocaleString()} raised
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-500">Avg. Donation</span>
                        <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                            <CreditCard className="w-4 h-4" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        ${avgDonation.toFixed(2)}
                    </h3>
                    <p className="text-xs text-gray-400">Per donor average</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-500">Total Donors</span>
                        <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{totalDonors.toLocaleString()}</h3>
                    <p className="text-xs text-gray-400">Unique contributors</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="font-bold text-gray-900">Revenue Trends</h3>
                            <p className="text-xs text-gray-500">Monthly breakdown of incoming donations</p>
                        </div>
                        <div className="bg-gray-100 text-xs font-bold text-gray-600 px-3 py-1.5 rounded-lg">
                            {monthlyData.length} months
                        </div>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-4 px-2">
                        {chartBars.map((item: any, idx: number) => {
                            const h = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0
                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="w-full relative h-48 flex items-end">
                                        <div
                                            className="w-full rounded-t-sm transition-all duration-500 group-hover:opacity-80 bg-blue-400"
                                            style={{ height: `${Math.max(h, 2)}%` }}
                                        />
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            ${item.amount.toLocaleString()}
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.m}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Top Campaigns */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="font-bold text-gray-900 mb-6">Top Campaigns</h3>
                    <div className="flex-1 space-y-4">
                        {topCampaigns.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-8">No campaign data yet.</p>
                        ) : (
                            topCampaigns.map((camp: any, i: number) => {
                                const raised = (camp.raised_cents || 0) / 100
                                const goal = (camp.goal_cents || 1) / 100
                                const progress = Math.min((raised / goal) * 100, 100)
                                return (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-900 truncate">{camp.title}</span>
                                            <span className="text-xs font-bold text-gray-500">${raised.toLocaleString()}</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Recent Donations</h3>
                    <Button variant="outline" className="h-9 text-xs border-gray-200">
                        <Filter className="w-3 h-3 mr-2" /> All <ChevronDown className="w-3 h-3 ml-2 text-gray-400" />
                    </Button>
                </div>

                {transactions.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">No transactions found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-bold tracking-wider">ID</th>
                                    <th className="px-6 py-4 font-bold tracking-wider">Donor</th>
                                    <th className="px-6 py-4 font-bold tracking-wider">Date</th>
                                    <th className="px-6 py-4 font-bold tracking-wider text-right">Amount</th>
                                    <th className="px-6 py-4 font-bold tracking-wider text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transactions.map((tx: any, i: number) => (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{tx.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                                                    {tx.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                                                </div>
                                                <span className="font-medium text-gray-900">{tx.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{tx.date}</td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900">${tx.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-green-50 text-green-700 border border-green-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
