import { Button } from "../ui/button"
import { Link } from "react-router-dom"
import { Clock, MapPin, Zap } from "lucide-react"

interface UrgentRequestCardProps {
    image: string
    title: string
    location: string
    description: string
    deadline: string
    timeLimit: string
}

export function UrgentRequestCard({ image, title, location, description, deadline, timeLimit }: UrgentRequestCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            {/* Image Header */}
            <div className="h-48 relative overflow-hidden">
                <img src={image} alt={title} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 flex gap-2">
                    <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center shadow-sm">
                        <Zap className="w-3 h-3 mr-1 fill-white" />
                        URGENT
                    </div>
                    <div className="bg-white/90 backdrop-blur text-red-600 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                        {timeLimit}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900 leading-tight">{title}</h3>
                    {location && (
                        <div className="flex items-center text-xs font-medium text-blue-500 whitespace-nowrap bg-blue-50 px-2 py-1 rounded-lg">
                            <MapPin className="w-3 h-3 mr-1" />
                            {location}
                        </div>
                    )}
                </div>

                <p className="text-sm text-gray-500 mb-6 line-clamp-3 leading-relaxed flex-1">
                    {description}
                </p>

                <div className="pt-4 border-t border-gray-50 space-y-4">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Time Limit</p>
                        <div className="flex items-center text-sm font-bold text-red-500">
                            <Clock className="w-4 h-4 mr-1.5" />
                            {timeLimit}
                        </div>
                        {deadline && <div className="text-xs font-semibold text-red-400 mt-0.5">{deadline}</div>}
                    </div>

                    <Link to="/volunteer">
                        <Button className="w-full bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/20 font-semibold">
                            Apply Now
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
