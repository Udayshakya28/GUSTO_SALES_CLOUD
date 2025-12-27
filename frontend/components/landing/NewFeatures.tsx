import { Card } from "@/components/ui/card"
import { MessageSquare, TrendingUp, Target } from "lucide-react"

export function NewFeatures() {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-8 bg-card border-border hover:border-primary/50 transition-colors">
            <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">{"Every reply feels natural"}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {
                "Smart AI that understands context and community vibes to craft replies that actually help people—not spammy sales pitches that get you banned."
              }
            </p>
          </Card>

          <Card className="p-8 bg-card border-border hover:border-primary/50 transition-colors">
            <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">{"Skip the noise. Get the insights"}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {
                "No more scrolling through endless comment threads. Get instant summaries that highlight pain points, buying signals, and opportunities you care about."
              }
            </p>
          </Card>

          <Card className="p-8 bg-card border-border hover:border-primary/50 transition-colors">
            <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">{"AI-Powered Response Generation"}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {
                "Get qualified leads with AI-generated responses ready to send. Our system analyzes your business and finds ideal customers automatically."
              }
            </p>
          </Card>
        </div>
      </div>
    </section>
  )
}

