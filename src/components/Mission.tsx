import { Droplets, GraduationCap, HeartHandshake } from "lucide-react"
import { Card, CardContent } from "./ui/card"
import { useIntersectionObserver } from "../hooks/useIntersectionObserver"

export function Mission() {
    const { targetRef, isIntersecting } = useIntersectionObserver()

    const missions = [
        {
            icon: Droplets,
            color: "text-blue-500",
            bg: "bg-blue-50",
            title: "Clean Water",
            description: "Providing clean and safe drinking water to communities in need across the globe."
        },
        {
            icon: GraduationCap,
            color: "text-green-500",
            bg: "bg-green-50",
            title: "Education",
            description: "Building schools and providing educational resources to empower the next generation."
        },
        {
            icon: HeartHandshake,
            color: "text-purple-500",
            bg: "bg-purple-50",
            title: "Community Support",
            description: "Supporting local communities with healthcare, food security, and economic development."
        }
    ]

    return (
        <section ref={targetRef as any} className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`text-center mb-16 transform transition-all duration-700 ${isIntersecting ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Our Mission</h2>
                    <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                        We are dedicated to making a lasting impact by addressing critical needs and empowering communities to thrive.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {missions.map((mission, index) => (
                        <Card
                            key={index}
                            className={`border-none shadow-lg bg-gray-50/50 hover:shadow-xl transition-all duration-500 transform ${isIntersecting ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                            style={{ transitionDelay: `${index * 150}ms` }}
                        >
                            <CardContent className="flex flex-col items-center text-center p-8">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${mission.bg}`}>
                                    <mission.icon className={`w-8 h-8 ${mission.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{mission.title}</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {mission.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
