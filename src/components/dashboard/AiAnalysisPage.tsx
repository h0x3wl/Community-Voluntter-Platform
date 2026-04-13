
import { Button } from "../ui/button"
import {
    CloudUpload,
    MapPin,
    Clock,
    Smartphone,
    CheckCircle2,
    Download,
    BarChart,
    Box,
    Users
} from "lucide-react"

export function AiAnalysisPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Impact Verification</h1>
                <p className="text-gray-500">
                    Upload humanitarian field photos for instant AI-powered auditing and verification.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Upload Zone */}
                    <div className="border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50/50 p-12 text-center transition-all hover:bg-blue-50 hover:border-blue-300 group cursor-pointer">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                            <CloudUpload className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Upload Zone</h3>
                        <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                            Drag and drop field photos here or click to browse. AI will automatically detect humanitarian activity.
                        </p>
                        <Button className="font-medium bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/20">
                            Select Photo
                        </Button>
                    </div>

                    {/* Live Analysis Progress */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2 font-semibold text-sm text-gray-900">
                                <BarChart className="w-4 h-4 text-blue-500" />
                                Live AI Analysis
                            </div>
                            <span className="text-xs font-medium text-blue-500">85% Complete</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                            <div className="bg-blue-500 h-2 rounded-full w-[85%] transition-all duration-1000" />
                        </div>
                        <p className="text-xs text-gray-400">Extracting geolocation data and verifying visual markers...</p>
                    </div>

                    {/* Audit Results */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">AI Audit Results</h3>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                VERIFIED
                            </span>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                <img
                                    src="/ai-analysis-food-distribution.png"
                                    alt="Analyzed Field Photo"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-400 uppercase font-medium mb-1">Detected Impact</p>
                                <h4 className="text-lg font-bold text-gray-900 mb-4">Food Distribution Confirmed</h4>

                                <div className="mb-4">
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="text-gray-500 font-medium">AI Confidence Level</span>
                                        <span className="text-gray-900 font-bold">98.2%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                        <div className="bg-blue-600 h-1.5 rounded-full w-[98.2%]" />
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <div className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-700 flex items-center gap-1.5">
                                        <Box className="w-3.5 h-3.5 text-gray-500" />
                                        80+ Aid Packages
                                    </div>
                                    <div className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-700 flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-gray-500" />
                                        Safe Crowd Management
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Impact Details Card */}
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900">Impact Details</h3>
                        </div>

                        {/* Map Placeholder */}
                        <div className="h-40 bg-gray-200 relative">
                            <div className="absolute inset-0 flex items-center justify-center opacity-50 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 drop-shadow-md">
                                <MapPin className="w-8 h-8 fill-current" />
                            </div>
                            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-mono border border-gray-200 shadow-sm">
                                GPS LOCKED
                            </div>
                        </div>

                        <div className="p-5 space-y-5">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Timestamp</p>
                                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    Oct 24, 2023 • 14:22:15 GMT+3
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Coordinates</p>
                                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    1.2921° S, 36.8219° E
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Device Integrity</p>
                                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                    <Smartphone className="w-4 h-4 text-green-500" />
                                    Samsung SM-G991B (Secure)
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button variant="outline" className="w-full h-10 border-gray-200 text-gray-700">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export Metadata
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Verification Summary */}
                    <div className="bg-blue-50 rounded-xl border border-blue-100 p-5">
                        <h4 className="font-bold text-blue-900 text-sm mb-2">Verification Summary</h4>
                        <p className="text-xs text-blue-800 leading-relaxed mb-3">
                            The AI analysis confirms that this photo matches the reported activity in Sector 4. Visual markers for UN-standard rations are present.
                        </p>
                        <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center">
                            View Full Audit Log &rarr;
                        </a>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-gray-400">
                            AI Model v2.4 • Last Updated Oct 2023
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
