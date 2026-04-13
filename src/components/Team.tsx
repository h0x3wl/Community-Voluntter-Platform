import { User } from "lucide-react"
import { useIntersectionObserver } from "../hooks/useIntersectionObserver"

export function Team() {
    const { targetRef, isIntersecting } = useIntersectionObserver({ threshold: 0.1 })

    const team = [
        {
            name: "Ahmed Mohamed",
            role: "UI/UX",
        },
        {
            name: "Hossam Wael",
            role: "Frontend",
        },
        {
            name: "Mohaned Yasser",
            role: "Backend",
        },
        {
            name: "Ibrahim Hany",
            role: "Frontend",
        },
        {
            name: "Ahmed Temsah",
            role: "AI",
        },
        {
            name: "Ahmed Essam",
            role: "Frontend",
        }
    ]

    return (
        <section ref={targetRef as any} className="py-20 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`text-left mb-12 transform transition-all duration-700 ${isIntersecting ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Our Team</h2>
                    <p className="mt-4 text-gray-600">Meet the dedicated individuals behind our mission.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {team.map((member, index) => (
                        <div
                            key={index}
                            className={`flex flex-col items-center text-center group transform transition-all duration-500 ${isIntersecting ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                            style={{ transitionDelay: `${index * 100}ms` }}
                        >
                            <div className="w-24 h-24 sm:w-32 sm:h-32 mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                            <p className="text-sm text-primary font-medium">{member.role}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
