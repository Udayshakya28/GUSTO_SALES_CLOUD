import { UserProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export function AccountSettings() {
  return (
    <div>
      <h3 className="text-lg font-medium">Account Settings</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Manage your account details, password, and multi-factor authentication.
      </p>
      <UserProfile
        path="/dashboard/settings"
        routing="path"
        appearance={{
          baseTheme: dark,
          elements: {
            card: "shadow-none",
            rootBox: "w-full",
          },
        }}
      />
    </div>
  );
}