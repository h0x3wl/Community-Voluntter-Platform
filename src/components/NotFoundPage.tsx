import { Button } from "./ui/button"
import { Link } from "react-router-dom"
import { Heart } from "lucide-react"

export function NotFoundPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6">
                <Heart className="w-8 h-8 fill-blue-600" />
            </div>
            <h1 className="text-9xl font-extrabold text-blue-600 tracking-tighter mb-4">404</h1>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
            <p className="text-gray-500 max-w-md mb-8">
                Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Link to="/">
                <Button className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 font-bold">
                    Return Home
                </Button>
            </Link>
        </div>
    )
}
