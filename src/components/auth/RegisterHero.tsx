import { Quote } from "lucide-react"

export function RegisterHero() {
    return (
        <div className="absolute inset-0 h-full w-full">
            <img
                src="/register-hero.png"
                alt="Volunteers planting trees"
                className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute bottom-16 left-12 right-12 text-white z-10">
                <Quote className="w-12 h-12 text-cyan-400 mb-6 fill-cyan-400" />
                <h2 className="text-3xl font-medium italic leading-relaxed mb-6">
                    "The smallest act of kindness is worth more than the grandest intention."
                </h2>
                <p className="text-lg font-medium opacity-90">— Oscar Wilde</p>

                <div className="flex items-center gap-3 mt-10">
                    <div className="flex -space-x-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-600 overflow-hidden">
                                <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="User" />
                            </div>
                        ))}
                    </div>
                    <span className="text-sm font-medium">Join 10,000+ Changemakers</span>
                </div>
            </div>
        </div>
    )
}
