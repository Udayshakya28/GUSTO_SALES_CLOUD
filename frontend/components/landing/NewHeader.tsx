import Link from "next/link"
import { Button } from "@/components/ui/button"

export function NewHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="h-8 w-1.5 rounded-full" style={{ backgroundColor: "#11FEFF" }} />
            <span className="text-xl font-bold" style={{ color: "#11FEFF" }}>
              Gusto Sales Cloud
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {"Features"}
          </Link>
          <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {"Pricing"}
          </Link>
          <Link href="#demo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {"Demo"}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-foreground" asChild>
            <Link href="/sign-in">{"Sign In"}</Link>
          </Button>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
            <Link href="/sign-up">{"Get Started"}</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

