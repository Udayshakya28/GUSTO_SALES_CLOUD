<<<<<<< HEAD
import { DashboardLayout } from "@/components/dashboard/DashBoardLayout";
import  Features  from "@/components/landing/Feature";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";

import { HowToDo } from "@/components/landing/HowToDo";
import { WhyReddit } from "@/components/landing/WhyReddit";
 
import { AdvantageComponent } from "@/components/landing/RedReach";
import PricingComponent from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";
import { Vort } from "@/components/landing/Vort";
import { IntegrationsMarquee } from "@/components/landing/Marquee";
import { FeaturesStart } from "@/components/landing/FeatureStart";

export default function Home() {
  return (
     <>
       <div className="relative">
         <Header />
         <Hero />
         <IntegrationsMarquee/>
         <FeaturesStart />
          <WhyReddit />    
          <HowToDo/>
          <div id="pricing" className="bg-black py-20">
          <PricingComponent/>
          </div>
          
          <div>
       
          </div>
          
         
          <Footer />
        
         
       </div>
      
     </>
  );
=======
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
>>>>>>> landing/main
}