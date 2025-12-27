import { NewHero } from "@/components/landing/NewHero"
import { NewFeatures } from "@/components/landing/NewFeatures"
import { NewWhyReddit } from "@/components/landing/NewWhyReddit"
import { NewHowItWorks } from "@/components/landing/NewHowItWorks"
import { NewPricing } from "@/components/landing/NewPricing"
import { NewFooter } from "@/components/landing/NewFooter"
import { NewHeader } from "@/components/landing/NewHeader"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <NewHeader />
      <main>
        <NewHero />
        <NewFeatures />
        <NewWhyReddit />
        <NewHowItWorks />
        <NewPricing />
      </main>
      <NewFooter />
    </div>
  )
}