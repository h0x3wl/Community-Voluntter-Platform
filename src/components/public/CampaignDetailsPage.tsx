import { Button } from "../ui/button"
import { Header } from "../Header"
import { Footer } from "../Footer"
import { Heart, Share2, Calendar, User, Clock, CheckCircle } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"

export function CampaignDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const [activeTab, setActiveTab] = useState("story");
    const [campaign, setCampaign] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            try {
                const res = await api.getCampaignDetails(id);
                setCampaign(res.data);
            } catch (err) {
                console.error("Failed to fetch campaign details", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <span className="text-gray-500">Loading campaign details...</span>
                </main>
                <Footer />
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
                <Header />
                <main className="flex-1 flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-bold mb-2">Campaign Not Found</h2>
                    <p className="text-gray-500 mb-6">The campaign you are looking for does not exist.</p>
                    <Link to="/campaigns"><Button>Browse Campaigns</Button></Link>
                </main>
                <Footer />
            </div>
        );
    }

    const raised = (campaign.raised_cents || 0) / 100;
    const goal = (campaign.goal_cents || 0) / 100;
    const progress = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
    
    // Provide safe defaults if the backend lacks these fields
    const story = campaign.description || 'No description available for this campaign.';
    const updates = campaign.updates || [];
    const recentDonors = campaign.recent_donors || [];

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
            <Header />

            <main className="flex-1 pb-20">
                {/* Hero / Image */}
                <div className="w-full h-[400px] relative bg-gray-100">
                    <img src={campaign.image_url || `https://picsum.photos/seed/${id}/1200/400`} alt={campaign.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end">
                        <div className="container mx-auto px-4 pb-12">
                            <span className="inline-block px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
                                {campaign.category?.name || "Community"}
                            </span>
                            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 text-shadow-sm">{campaign.title}</h1>
                            <div className="flex flex-wrap items-center gap-6 text-white text-sm font-medium">
                                <span className="flex items-center gap-2"><User className="w-4 h-4" /> Organized by {campaign.organization?.name || "Hope Foundation"}</span>
                                <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Created Recently</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
                            <button
                                onClick={() => setActiveTab("story")}
                                className={`pb-4 px-6 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors whitespace-nowrap ${activeTab === 'story' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Story
                            </button>
                            <button
                                onClick={() => setActiveTab("updates")}
                                className={`pb-4 px-6 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors whitespace-nowrap ${activeTab === 'updates' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Updates <span className="ml-1 bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px]">{updates.length}</span>
                            </button>
                            <button
                                onClick={() => setActiveTab("donors")}
                                className={`pb-4 px-6 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors whitespace-nowrap ${activeTab === 'donors' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Donors
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[300px]">
                            {activeTab === "story" && (
                                <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                                    {story}
                                </div>
                            )}

                            {activeTab === "updates" && (
                                <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-100">
                                    {updates.map((update: any, i: number) => (
                                        <div key={i} className="pl-12 relative">
                                            <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-blue-50 border-4 border-white flex items-center justify-center text-blue-600 shadow-sm z-10">
                                                <CheckCircle className="w-5 h-5" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wide">{update.date}</span>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">{update.title}</h3>
                                            <p className="text-gray-600 text-sm leading-relaxed">{update.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === "donors" && (
                                <div className="space-y-4">
                                    {recentDonors.length === 0 && (
                                        <div className="py-12 text-center text-gray-400 text-sm">
                                            No donations yet. Be the first to contribute!
                                        </div>
                                    )}
                                    {recentDonors.map((donor: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                                                    {donor.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{donor.name}</p>
                                                    <p className="text-xs text-gray-500">{donor.time}</p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-green-600">+${donor.amount}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sticky top-24">
                            <div className="flex items-end justify-between mb-3">
                                <span className="text-4xl font-extrabold text-gray-900">${raised.toLocaleString()}</span>
                            </div>
                            <div className="text-sm text-gray-500 mb-4 font-medium">raised of ${goal.toLocaleString()} goal</div>
                            <div className="w-full bg-gray-100 rounded-full h-2 mb-8 overflow-hidden">
                                <div className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="block text-2xl font-bold text-gray-900 mb-1">{campaign.donors_count || 0}</span>
                                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Donors</span>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="block text-2xl font-bold text-gray-900 mb-1">{campaign.days_left || 0}</span>
                                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Days Left</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Link to={`/donate?campaign=${campaign.public_id}`}>
                                    <Button className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 rounded-xl">
                                        Donate Now
                                    </Button>
                                </Link>
                                <Button variant="outline" className="w-full h-14 text-gray-700 hover:text-blue-600 border-gray-200 font-semibold rounded-xl hover:bg-gray-50">
                                    <Share2 className="w-5 h-5 mr-2" /> Share Campaign
                                </Button>
                            </div>

                            <div className="flex items-center justify-center gap-2 mt-6 p-4 bg-green-50 rounded-lg text-green-700 text-xs font-semibold">
                                <Heart className="w-4 h-4" />
                                All donations are secure and encrypted.
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
