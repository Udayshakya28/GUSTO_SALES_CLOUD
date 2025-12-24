"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { BillingSettings } from "@/components/settings/BillingSettings";
import { DangerZone } from "@/components/settings/DangerZone";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { SettingsSidebarNav } from "@/components/settings/SettingsSidebar";
import { EmailSettings } from "@/components/settings/EmailSettings";
import { AccountSettings } from "@/components/settings/AccountSettings";

// Main component for the settings page
export default function SettingsPage() {
  // State to manage the currently active settings view
  const [activeView, setActiveView] = useState("profile");

  // Function to render the component based on the active view
  const renderView = () => {
    switch (activeView) {
      case "profile":
        return <ProfileSettings />;
      case "notifications":
        return <NotificationSettings />
      case "billing":
        return <BillingSettings />;
      case "danger":
        return <DangerZone />;
      case "account":
        return <AccountSettings/>; // Assuming Account settings are similar to Profile
      case "email":
        return <EmailSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="hidden space-y-6 p-4 md:p-10 pb-16 md:block">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight text-white">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings, preferences, and billing.
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-8 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/6 lg:flex-shrink-0">
          <SettingsSidebarNav activeView={activeView} setActiveView={setActiveView} />
        </aside>
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-3xl mx-auto px-4 lg:px-8">
            {renderView()}
          </div>
        </div>
      </div>
    </div>
  );
}
