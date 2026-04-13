import { Header } from "./Header"
import { Hero } from "./Hero"
import { Mission } from "./Mission"
import { Stats } from "./Stats"
import { OurStory } from "./OurStory"
import { Team } from "./Team"
import { FeaturedCampaigns } from "./FeaturedCampaigns"
import { GetInvolved } from "./GetInvolved"
import { MakeDonation } from "./MakeDonation"
import { Testimonial } from "./Testimonial"
import { HelpLegal } from "./HelpLegal"
import { Newsletter } from "./Newsletter"
import { Footer } from "./Footer"

export function LandingPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            <Header />
            <main>
                <Hero />
                <Mission />
                <Stats />
                <OurStory />
                <Team />
                <FeaturedCampaigns />
                <GetInvolved />
                <MakeDonation />
                <Testimonial />
                <HelpLegal />
                <Newsletter />
            </main>
            <Footer />
        </div>
    )
}
