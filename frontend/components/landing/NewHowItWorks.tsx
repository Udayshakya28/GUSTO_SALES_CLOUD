import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link2, Search, MessageCircle } from "lucide-react"
import Link from "next/link"

export function NewHowItWorks() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            {"Get Started in "}
            <span style={{ color: "#227274" }}>{"3 Simple Steps"}</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            {"From setup to your first qualified lead in under 5 minutes"}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <Card className="p-8 bg-[#1a1a1a] border border-[#2a2a2a] relative">
            <div
              className="absolute -top-4 -left-4 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ backgroundColor: "#227274" }}
            >
              {"1"}
            </div>
            <div className="mb-6 w-12 h-12 rounded-lg bg-[#2a2a2a] flex items-center justify-center ml-auto">
              <Link2 className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">{"Connect Your Business"}</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              {"Paste your website URL. AI analyzes your business and finds ideal customers."}
            </p>
            <Button variant="link" className="p-0 h-auto" style={{ color: "#227274" }}>
              {"Start Setup →"}
            </Button>
          </Card>

          <Card className="p-8 bg-[#1a1a1a] border border-[#2a2a2a] relative">
            <div
              className="absolute -top-4 -left-4 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ backgroundColor: "#227274" }}
            >
              {"2"}
            </div>
            <div className="mb-6 w-12 h-12 rounded-lg bg-[#2a2a2a] flex items-center justify-center ml-auto">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">{"AI Finds Your Leads"}</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              {"Our system scans Reddit 24/7, finding prospects actively seeking your solutions."}
            </p>
            <Button variant="link" className="p-0 h-auto" style={{ color: "#227274" }}>
              {"See How It Works →"}
            </Button>
          </Card>

          <Card className="p-8 bg-[#1a1a1a] border border-[#2a2a2a] relative">
            <div
              className="absolute -top-4 -left-4 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ backgroundColor: "#227274" }}
            >
              {"3"}
            </div>
            <div className="mb-6 w-12 h-12 rounded-lg bg-[#2a2a2a] flex items-center justify-center ml-auto">
              <MessageCircle className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">{"Start Converting"}</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              {"Get qualified leads with AI-generated responses ready to send."}
            </p>
            <Button variant="link" className="p-0 h-auto" style={{ color: "#227274" }}>
              {"View Examples →"}
            </Button>
          </Card>
        </div>

        <div className="flex gap-4 justify-center">
          <Button size="lg" className="bg-white text-black hover:bg-gray-100 font-semibold px-8" asChild>
            <Link href="/sign-up">
              <span className="mr-2" style={{ color: "#227274" }}>
                ●
              </span>
              {"Get started for free"}
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-gray-700 text-white hover:bg-gray-900 font-semibold px-8 bg-transparent"
            asChild
          >
            <Link href="#pricing">{"See plans & pricing"}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

