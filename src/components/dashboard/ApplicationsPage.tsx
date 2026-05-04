import { Info, Calendar } from "lucide-react"
import { Button } from "../ui/button"
import { ApplicationStatusCard } from "./ApplicationStatusCard"
import { ActivityLog } from "./ActivityLog"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"

export function ApplicationsPage() {
    const [applications, setApplications] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const res = await api.getMyApplications()
                setApplications(res.data || [])
            } catch (err) {
                console.error("Failed to fetch applications", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchApps()
    }, [])

    const mainApp = applications.length > 0 ? applications[0] : null
    const status = mainApp?.status || 'none'

    return (
        <div className="space-y-8 relative">
            {isLoading && (
                <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                    <span className="text-gray-500">Loading your applications...</span>
                </div>
            )}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Progress</h1>
                <p className="text-gray-500">Track your journey to becoming a community volunteer.</p>
            </div>

            <div className="space-y-6">
                {/* Status Card */}
                {status !== 'none' ? (
                    <ApplicationStatusCard status={status} />
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-500">
                        {!isLoading && "You haven't submitted any applications yet."}
                    </div>
                )}

                {/* Info Cards Grid */}
                {status === 'approved' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Next Steps */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <Info className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Next Steps</h3>
                                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                                    To finalize your application, you need to attend the virtual orientation session. During this session, you'll meet your team leader and learn about our safety protocols.
                                </p>
                            </div>
                        </div>

                        {/* Upcoming Session */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Upcoming Session</h3>
                                <div className="mb-3">
                                    <p className="text-sm font-semibold text-gray-900">Orientation Webinar</p>
                                    <p className="text-xs text-gray-500">Soon • Details in email</p>
                                </div>
                                <Button variant="link" className="text-blue-500 p-0 h-auto font-semibold text-sm">
                                    Add to Calendar &rarr;
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Activity Log */}
                {status !== 'none' && <ActivityLog />}
            </div>
        </div>
    )
}
