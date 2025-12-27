"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";

export function BillingSettings() {
    const { user } = useUser();
    // In a real app, you'd fetch subscription data here
    const plan = user?.publicMetadata?.plan || "Free";

  return (
    <Card className="border-zinc-800 bg-zinc-950 text-white">
      <CardHeader>
        <CardTitle>Billing</CardTitle>
        <CardDescription>
          Manage your subscription and payment details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-4 border border-zinc-800 rounded-lg">
            <div>
                <h4 className="font-semibold">Your Plan</h4>
                <p className="text-2xl font-bold capitalize">{String(plan)}</p>
            </div>
            <Button className="bg-white text-black hover:bg-gray-200">
                Manage Subscription
            </Button>
        </div>
        <p className="text-xs text-muted-foreground">
            You will be redirected to our payment provider to manage your subscription.
        </p>
      </CardContent>
    </Card>
  );
}
