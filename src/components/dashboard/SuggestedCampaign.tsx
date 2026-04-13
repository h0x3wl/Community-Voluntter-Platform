import { Button } from "../ui/button"
import { Link } from "react-router-dom"

export function SuggestedCampaign({ campaign }: { campaign?: any }) {
    if (!campaign) return null;

    const raised = (campaign.raised_cents || 0) / 100
    const goal = (campaign.goal_cents || 1) / 100
    const progress = Math.min((raised / goal) * 100, 100)

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group">
            <div className="h-48 overflow-hidden relative bg-gray-100 flex items-center justify-center">
                <img
                    src={campaign.image_url || `https://picsum.photos/seed/${campaign.public_id || 'new'}/400/300`}
                    alt={campaign.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>
            <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2" title={campaign.title}>{campaign.title}</h3>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed line-clamp-2 title={campaign.description}">
                    {campaign.description || "A highly recommended cause for your contribution."}
                </p>

                <div className="mt-auto">
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-blue-600">${raised.toLocaleString()} raised</span>
                        <span className="text-gray-400">Goal: ${goal.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
                        <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>

                    <Link to={`/campaigns/${campaign.share_slug || campaign.public_id}`}>
                        <Button variant="outline" className="w-full font-bold">
                            View Details
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
