import { AuthHero } from "./AuthHero"
import { LoginForm } from "./LoginForm"

export function LoginPage() {
    return (
        <div className="flex min-h-screen w-full bg-white">
            <div className="hidden lg:block w-1/2 relative">
                <AuthHero />
            </div>
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <LoginForm />
            </div>
        </div>
    )
}
