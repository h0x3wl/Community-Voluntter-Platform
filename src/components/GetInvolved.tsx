import { HandHeart, Megaphone, Users2 } from "lucide-react"
import { Link } from "react-router-dom"

export function GetInvolved() {
    const actions = [
        {
            icon: HandHeart,
            title: "Volunteer",
            description: "Join our team of dedicated volunteers and make a hands-on difference.",
            link: "Join now",
            path: "/volunteer",
            color: "text-blue-500",
            bg: "bg-blue-50"
        },
        {
            icon: Megaphone,
            title: "Fundraise",
            description: "Start your own fundraising campaign to support a cause you care about.",
            link: "Start fundraising",
            path: "/campaigns",
            bg: "bg-green-50",
            color: "text-green-500"
        },
        {
            icon: Users2,
            title: "Community",
            description: "Connect with like-minded individuals and share your journey.",
            link: "Join community",
            path: "/register", // Or /login if preferred
            bg: "bg-purple-50",
            color: "text-purple-500"
        }
    ]

    return (
        <section className="py-20 bg-gray-50/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Get Involved</h2>
                    <p className="mt-4 text-gray-600">Three easy ways to join our mission.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {actions.map((action, index) => (
                        <div key={index} className="flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 ${action.bg}`}>
                                <action.icon className={`w-7 h-7 ${action.color}`} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{action.title}</h3>
                            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                                {action.description}
                            </p>
                            <Link to={action.path} className={`text-sm font-semibold uppercase tracking-wide ${action.color} hover:underline`}>
                                {action.link}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
