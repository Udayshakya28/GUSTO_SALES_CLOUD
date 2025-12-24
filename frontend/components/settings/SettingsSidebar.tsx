"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { User, Bell, CreditCard, ShieldAlert, Cog } from "lucide-react"; // Import Cog

// Sidebar navigation items
const sidebarNavItems = [
  {
    title: "Profile",
    icon: <User className="mr-2 h-4 w-4" />,
    view: "profile",
  },
  {
    title: "Account",
    icon: <Cog className="mr-2 h-4 w-4" />, // Added Account section
    view: "account",
  },
  {
    title: "Notifications",
    icon: <Bell className="mr-2 h-4 w-4" />,
    view: "notifications",
  },
  {
    title: "Billing",
    icon: <CreditCard className="mr-2 h-4 w-4" />,
    view: "billing",
  },
  {
    title: "Danger Zone",
    icon: <ShieldAlert className="mr-2 h-4 w-4" />,
    view: "danger",
  },
];

interface SettingsSidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  activeView: string;
  setActiveView: (view: string) => void;
}

export function SettingsSidebarNav({
  className,
  activeView,
  setActiveView,
  ...props
}: SettingsSidebarNavProps) {
  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      {sidebarNavItems.map((item) => (
        <Button
          key={item.view}
          onClick={() => setActiveView(item.view)}
          variant="ghost"
          className={cn(
            "w-full justify-start hover:bg-zinc-800 hover:text-white",
            activeView === item.view
              ? "bg-zinc-800 text-white"
              : "text-muted-foreground"
          )}
        >
          {item.icon}
          {item.title}
        </Button>
      ))}
    </nav>
  );
}