import Link from "next/link"

export function NewFooter() {
  return (
    <footer className="border-t border-border py-12 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-1 mb-4">
              <div className="h-6 w-1 bg-destructive rounded-full" />
              <span className="text-lg font-bold text-foreground">{"Gusto Sales Cloud"}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{"AI-powered Reddit lead generation tool."}</p>
            <p className="text-xs text-muted-foreground">{"Made with ❤️ by a solo founder"}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">{"Product"}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {"Features"}
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {"Pricing"}
                </Link>
              </li>
              <li>
                <Link href="#demo" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {"Demo"}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">{"Resources"}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {"Blog"}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {"Help"}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {"Changelog"}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">{"Legal"}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {"Privacy"}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {"Terms"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            {"© 2025 Gusto Development. Built by @attharrva15"}
          </p>
        </div>
      </div>
    </footer>
  )
}

