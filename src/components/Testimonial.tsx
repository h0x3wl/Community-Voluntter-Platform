export function Testimonial() {
    return (
        <section className="py-20 bg-white text-center">
            <div className="container mx-auto px-4">
                <blockquote className="max-w-4xl mx-auto">
                    <p className="text-2xl sm:text-3xl md:text-4xl font-serif italic text-gray-900 leading-relaxed mb-8">
                        "This organization changed my life. The support was immediate and the impact was everlasting."
                    </p>
                    <footer className="flex flex-col items-center">
                        <img
                            src="https://i.pravatar.cc/150?img=9"
                            alt="Maria J."
                            className="w-16 h-16 rounded-full border-2 border-white shadow-md mb-3"
                        />
                        <cite className="not-italic font-bold text-gray-900 block">Maria J.</cite>
                        <span className="text-sm text-gray-500">Beneficiary</span>
                    </footer>
                </blockquote>
            </div>
        </section>
    )
}
