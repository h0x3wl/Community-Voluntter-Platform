import { Button } from "../ui/button"
import { Check, Flag } from "lucide-react"
import { cn } from "../../lib/utils"

export function ApplicationStatusCard({ status }: { status: string }) {

    // Define steps based on the real string status. The docs say "pending", "approved", etc.
    const stepsData = [
        { id: 1, label: "Applied", statusTarget: ["pending", "review", "approved", "rejected"] },
        { id: 2, label: "Reviewed", statusTarget: ["review", "approved", "rejected"] },
        { id: 3, label: "Result", statusTarget: ["approved", "rejected"] },
    ]

    const currentIndex = stepsData.findIndex(s => s.statusTarget.includes(status))
    // Determine overall completion ratio
    let ratio = "0%"
    if (status === 'pending') ratio = "33%"
    if (status === 'review') ratio = "66%"
    if (status === 'approved' || status === 'rejected') ratio = "100%"

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                        {status === 'pending' && "Application Received"}
                        {status === 'review' && "Under Review"}
                        {status === 'approved' && "You're Accepted!"}
                        {status === 'rejected' && "Application Update"}
                        {!['pending', 'review', 'approved', 'rejected'].includes(status) && "Application Status"}
                    </h2>
                    <p className="text-gray-500">
                        {status === 'pending' && "We've received your application and will review it shortly."}
                        {status === 'review' && "Our team is currently reviewing your profile."}
                        {status === 'approved' && "We're thrilled to have you join our team."}
                        {status === 'rejected' && "Unfortunately, we cannot proceed at this time."}
                    </p>
                </div>
                <div className="flex gap-3">
                    {status === 'approved' && <Button className="bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/20">Start Onboarding</Button>}
                    <Button variant="outline" className="bg-gray-50 border-gray-100 text-gray-700 hover:bg-gray-100">View Details</Button>
                </div>
            </div>

            <div className="mb-12">
                <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">Overall Progress</span>
                    <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded">{ratio} Complete</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: ratio }} />
                </div>
            </div>

            {/* Stepper */}
            <div className="relative">
                {/* Connector Line */}
                <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 -z-10" />
                <div className="absolute top-5 left-0 h-1 bg-green-500 -z-10 transition-all duration-1000" style={{ width: ratio }} />

                <div className="flex justify-between">
                    {stepsData.map((step, index) => {
                        const isCompleted = step.statusTarget.includes(status)
                        const isCurrent = step.statusTarget.includes(status) && (index === stepsData.length - 1 || !stepsData[index + 1].statusTarget.includes(status))
                        
                        return (
                            <div key={step.id} className="flex flex-col items-center">
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all mb-3 text-white",
                                        isCompleted && !isCurrent ? (status === 'rejected' ? "bg-red-500 border-red-500" : "bg-green-500 border-green-500") :
                                            isCurrent ? (status === 'rejected' ? "bg-red-500 border-red-500" : "bg-blue-500 border-blue-100") :
                                                "bg-white border-gray-200 text-gray-300"
                                    )}
                                >
                                    {isCompleted && !isCurrent ? (
                                        <Check className="w-5 h-5" />
                                    ) : isCurrent ? (
                                        <>
                                            <div className="absolute inset-0 rounded-full border-2 border-blue-500 animate-pulse" />
                                            <div className="w-2.5 h-2.5 bg-white rounded-full" />
                                        </>
                                    ) : (
                                        <Flag className="w-4 h-4 text-gray-300" />
                                    )}
                                </div>
                                <p className={cn("text-sm font-bold mb-0.5", isCurrent ? "text-blue-600" : "text-gray-900")}>
                                    {isCurrent && status === 'rejected' ? 'Rejected' : step.label}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
