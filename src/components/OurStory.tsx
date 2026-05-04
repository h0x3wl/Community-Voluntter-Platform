import { Button } from "./ui/button"

export function OurStory() {
    return (
        <section className="py-20 bg-white overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1 order-2 lg:order-1">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-6 sm:text-4xl">
                            Our Story
                        </h2>
                        <div className="space-y-4 text-lg text-gray-600">
                            <p>
                                Founded in 2010, CharityOrg began as a small initiative in a local community.
                                Witnessing the struggle for basic necessities, a group of friends decided to take action.
                                What started as a weekend volunteer project has now grown into a global movement.
                            </p>
                            <p>
                                Today, we work in over 120 countries, bringing hope and tangible change to millions of lives.
                                Our transparent approach helps ensure that your donation makes the maximum impact possible.
                            </p>
                        </div>
                        <Button variant="link" className="mt-6 px-0 text-primary text-lg font-semibold h-auto">
                            Read full story &rarr;
                        </Button>
                    </div>

                    <div className="flex-1 order-1 lg:order-2">
                        <div className="relative">
                            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl transform rotate-1 transition-transform hover:rotate-0">
                                <img
                                    src="/Children.png"
                                    alt="Our story illustration"
                                    className="w-70 h-auto max-w-lg mx-auto"
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
