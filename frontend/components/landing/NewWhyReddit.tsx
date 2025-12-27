import { Card } from "@/components/ui/card"

export function NewWhyReddit() {
  return (
    <section className="py-24 relative bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance text-foreground">
            {"THE NEW LEAD GEN "}
            <span className="text-primary">{"GOLDMINE"}</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">{"Why Reddit Wins the AI Era"}</p>
          <p className="text-lg text-muted-foreground mt-4 leading-relaxed">
            {
              "AI and search engines now favor authentic, human conversations—making Reddit the new goldmine for high-intent leads who are actively seeking solutions."
            }
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          <Card className="p-8 bg-card border-border text-center">
            <div className="text-5xl font-bold text-primary mb-2">{"73%"}</div>
            <p className="text-muted-foreground">{"of Google's first-page results feature Reddit threads"}</p>
          </Card>

          <Card className="p-8 bg-card border-border text-center">
            <div className="text-5xl font-bold text-primary mb-2">{"90%"}</div>
            <p className="text-muted-foreground">{"of users add 'reddit' to searches for trusted answers"}</p>
          </Card>
        </div>

        <div className="text-center">
          <div className="inline-block px-6 py-3 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-lg font-semibold text-primary">
              {"#1 source for solution-seeking AI queries and recommendations"}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

