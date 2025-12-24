// frontend/app/api/clerk-auth/[[...auth]]/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Fetch your user data from your DB
  // This is a placeholder; you'd implement this API endpoint on your backend
  const response = await fetch(`http://localhost:5000/api/users/${userId}`); 
  const user = await response.json();

  // Add custom claims
  // To add custom claims, you should do this on your backend when creating the session.
  // For now, you can include the claim in your response or handle it in your backend logic.
  // Example: return the claim in the response (for demonstration purposes)
  // return new NextResponse(JSON.stringify({ hasConnectedReddit: user.hasConnectedReddit }), { status: 200 });

  return new NextResponse(null, { status: 200 });
}