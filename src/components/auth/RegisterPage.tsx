import { RegisterForm } from "./RegisterForm"
import { RegisterHero } from "./RegisterHero"

export function RegisterPage() {
    return (
        <div className="flex min-h-screen w-full bg-white">
            <div className="hidden lg:block w-1/2 relative bg-gray-900">
                <RegisterHero />
            </div>
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 overflow-y-auto">
                <RegisterForm />
            </div>
        </div>
    )
}
