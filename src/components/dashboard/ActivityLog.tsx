import { CheckCircle2 } from "lucide-react"

interface ActivityItemProps {
    title: string
    description: string
    date: string
    completed?: boolean
}

function ActivityItem({ title, description, date, completed = true }: ActivityItemProps) {
    return (
        <div className="flex gap-4 relative">
            {/* Timeline Line */}
            <div className="absolute left-2.5 top-8 bottom-0 w-px bg-gray-100 last:hidden" />

            <div className="flex-shrink-0 mt-1">
                {completed ? (
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-green-100">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    </div>
                ) : (
                    <div className="w-5 h-5 rounded-full bg-gray-100 border-2 border-white ring-1 ring-gray-200" />
                )}
            </div>

            <div className="pb-8">
                <h4 className="text-sm font-bold text-gray-900 mb-1">{title}</h4>
                <p className="text-sm text-gray-500 mb-1">{description}</p>
                <p className="text-xs text-gray-400">{date}</p>
            </div>
        </div>
    )
}

export function ActivityLog() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h3 className="font-bold text-gray-900 mb-6">Activity Log</h3>

            <div className="">
                <ActivityItem
                    title='Accepted to "Food for Families" Program'
                    description="Your background check and interview were successful."
                    date="Oct 18, 11:45 AM"
                />
                <ActivityItem
                    title='Interview Completed'
                    description="Completed initial video interview with Sarah Jones."
                    date="Oct 14, 3:20 PM"
                />
                <ActivityItem
                    title='Application Submitted'
                    description="Application for general volunteering received."
                    date="Oct 12, 09:00 AM"
                />
            </div>
        </div>
    )
}
