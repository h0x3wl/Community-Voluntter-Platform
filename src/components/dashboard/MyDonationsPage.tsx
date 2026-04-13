import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Search, Filter, Calendar, Download, ChevronLeft, ChevronRight } from "lucide-react"
import { StatsCard } from "./StatsCard"
import { PiggyBank, Megaphone, Calendar as CalendarIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"

export function MyDonationsPage() {
    const [donations, setDonations] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const response = await api.getMyDonations()
                setDonations(response.data || [])
            } catch (error) {
                console.error("Failed to fetch donations", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchDonations()
    }, [])

    const totalCents = donations.reduce((acc, curr) => acc + (curr.amount_cents || 0), 0)
    const campaignsSupported = new Set(donations.map(d => d.campaign?.public_id || "unknown")).size
    const lastDate = donations.length > 0 && donations[0].paid_at ? new Date(donations[0].paid_at).toLocaleDateString() : "N/A"

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Donation History</h1>
                <p className="text-gray-500">Review your philanthropic impact and download receipts.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Total Donated"
                    value={`$${(totalCents / 100).toLocaleString()}`}
                    subtext="All time"
                    icon={PiggyBank}
                    bgIconColor="bg-green-100"
                    iconColor="text-green-600"
                />
                <StatsCard
                    title="Campaigns Supported"
                    value={String(campaignsSupported)}
                    subtext="Active contributor"
                    icon={Megaphone}
                    bgIconColor="bg-blue-100"
                    iconColor="text-blue-600"
                />
                <StatsCard
                    title="Last Donation"
                    value={lastDate}
                    subtext="Most recent"
                    icon={CalendarIcon}
                    bgIconColor="bg-purple-100"
                    iconColor="text-purple-600"
                />
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search by ID or Campaign..."
                        className="pl-9 h-12 bg-gray-50 border-gray-100 focus:bg-white transition-all rounded-xl"
                    />
                </div>
                <Button variant="outline" className="h-12 px-6 rounded-xl border-gray-200 text-gray-700 font-medium">
                    <Filter className="w-4 h-4 mr-2" />
                    All Statuses
                </Button>
                <Button variant="outline" className="h-12 px-6 rounded-xl border-gray-200 text-gray-700 font-medium">
                    <Calendar className="w-4 h-4 mr-2" />
                    Last 30 Days
                </Button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative min-h-[300px]">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 text-gray-500">
                        Loading donations...
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Campaign</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase text-right">Receipt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {donations.map((donation) => (
                                <tr key={donation.public_id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap">
                                        {donation.paid_at ? new Date(donation.paid_at).toLocaleDateString() : "Processing"}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-600 font-medium">
                                        {donation.campaign?.title || "Unknown Campaign"}
                                        <div className="text-xs text-gray-400 mt-0.5">{donation.public_id?.substring(0, 8)}...</div>
                                    </td>
                                    <td className="py-4 px-6 text-sm font-bold text-gray-900">
                                        ${((donation.amount_cents || 0) / 100).toFixed(2)}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${donation.status === 'succeeded' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {donation.status || "processing"}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                            <Download className="w-4 h-4 mr-1.5" />
                                            Download
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!isLoading && donations.length === 0 && (
                        <div className="py-12 text-center text-gray-500 text-sm">
                            No donations found. Time to make an impact!
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Showing <span className="font-medium text-gray-900">{donations.length > 0 ? 1 : 0}</span> to <span className="font-medium text-gray-900">{donations.length}</span> of <span className="font-medium text-gray-900">{donations.length}</span> results
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-lg border-gray-200" disabled>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-lg border-gray-200" disabled>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
