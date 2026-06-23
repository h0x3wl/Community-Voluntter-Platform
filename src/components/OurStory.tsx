export function OurStory() {
    return (
        <section className="py-20 bg-white overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1 order-2 lg:order-1">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-6 sm:text-4xl">
                            Our Story
                        </h2>
                        <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
                            <p>
                                <span className="font-semibold text-gray-800">Awn Community</span> is transforming the way the world gives, empowering people to make a difference through <span className="font-semibold text-gray-800">innovation and passion</span>. Our team is driven by a shared purpose to create meaningful impact, pushing boundaries to build a platform that connects communities through help.
                            </p>
                            <p>
                                We foster an environment of <span className="font-semibold text-gray-800">creativity and belonging</span> where velocity and collaboration fuel progress — where every team member plays a role in shaping the <span className="font-semibold text-gray-800">future of giving</span>.
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 order-1 lg:order-2">
                        <div className="relative">
                            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl transform rotate-1 transition-transform hover:rotate-0">
                                <img
                                    src="/charity.jpg"
                                    alt="Our story illustration"
                                    className="w-70 h-auto max-w-lg mx-auto"
                                    loading="lazy"
                                    width="512"
                                    height="384"
                                />
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-100 rounded-full -z-10" />
                            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-green-50 rounded-full -z-10" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
