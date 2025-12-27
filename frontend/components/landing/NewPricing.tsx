import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

export function NewPricing() {
  return (
    <section id="pricing" className="py-24 relative bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-sm text-muted-foreground mb-4">{"No credit card required • Get started in seconds"}</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            {"Simple, Transparent "}
            <span className="text-primary">{"Pricing"}</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            {"Choose the perfect plan to supercharge your Reddit lead generation"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all">
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2 text-foreground">{"Free"}</h3>
              <div className="text-4xl font-bold text-foreground">{"Free"}</div>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{"1 Project"}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{"5 Keywords"}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{"25 Leads per month"}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{"Basic support"}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <X className="w-4 h-4 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground/50">{"No AI features"}</span>
              </li>
            </ul>

            <Button variant="outline" className="w-full bg-transparent">
              {"Get Started Free"}
            </Button>
          </Card>

          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all">
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2 text-foreground">{"Starter"}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground">{"$19"}</span>
                <span className="text-muted-foreground">{"/mo"}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{"1 Project"}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{"15 Keywords"}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{"200 Leads per month"}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{"AI Intent Analysis"}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{"AI Replies (75/month)"}</span>
              </li>
            </ul>

            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {"Start 7-Day Trial"}
            </Button>
          </Card>

          <Card className="p-6 bg-card border-primary hover:border-primary transition-all relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary rounded-full text-xs font-semibold text-primary-foreground">
              {"POPULAR"}
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2 text-foreground">{"Pro"}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground">{"$49"}</span>
                <span className="text-muted-foreground">{"/mo"}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{"3 Projects"}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{"50 Keywords"}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{"1,000 Leads per month"}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{"AI Replies (300/month)"}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{"Competitor Tracking"}</span>
              </li>
            </ul>

            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {"Start 7-Day Trial"}
            </Button>
          </Card>

          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all">
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2 text-foreground">{"Enterprise"}</h3>
              <div className="text-4xl font-bold text-foreground">{"Custom"}</div>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{"Unlimited Projects"}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{"Unlimited Keywords"}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{"Unlimited Leads"}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{"Team Collaboration"}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{"API Access"}</span>
              </li>
            </ul>

            <Button variant="outline" className="w-full bg-transparent">
              {"Contact Sales"}
            </Button>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          {"All plans include 7-day free trial. No credit card required."}
        </p>
      </div>
    </section>
  )
}

