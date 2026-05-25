export function AuthHero() {
    return (
        <div className="absolute inset-0 h-full w-full">
            <img
                src="/login.jpg"
                alt="Volunteers planting trees"
                className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-16 left-12 right-12 text-white z-10">
                <h2 className="text-4xl font-bold mb-4">Empowering communities, one act at a time.</h2>
                <p className="text-lg mb-6">Join thousands of donors and volunteers making a real difference.</p>

                <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                        <img src="https://randomuser.me/api/portraits/women/68.jpg" className="w-10 h-10 rounded-full border-2 border-white" alt="User" />
                        <img src="https://randomuser.me/api/portraits/men/32.jpg" className="w-10 h-10 rounded-full border-2 border-white" alt="User" />
                        <img src="https://randomuser.me/api/portraits/women/44.jpg" className="w-10 h-10 rounded-full border-2 border-white" alt="User" />
                    </div>
                    <span className="text-sm font-medium">Trusted by 10,000+ changemakers</span>
                </div>
            </div>
        </div>
    )
}
