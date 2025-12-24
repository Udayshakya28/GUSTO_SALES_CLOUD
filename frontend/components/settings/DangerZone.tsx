//================================================================//
//          Your Existing Danger Zone Component                   //
//================================================================//
"use client";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";


 export const DangerZone = () => {
  const { getToken, signOut } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      await api.deleteCurrentUser(token);
      await signOut(() => window.location.replace("/"));
    } catch (error) {
      console.error("Failed to delete account", error);
      alert("Failed to delete account. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
      <h3 className="text-lg font-bold text-red-400">Danger Zone</h3>
      <p className="text-gray-400 text-sm mt-2">
        Deleting your account is permanent and cannot be undone. All of your campaigns, leads, and data will be permanently removed.
      </p>
      <button
        onClick={() => setShowConfirm(true)}
        className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
      >
        Delete My Account
      </button>

      {showConfirm && (
        <div className="mt-4 space-y-4">
          <p className="text-white">Are you sure? This action is irreversible.</p>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Deleting..." : "Yes, Delete My Account Permanently"}
          </button>
          <button onClick={() => setShowConfirm(false)} className="w-full text-center text-gray-400 hover:text-white text-sm">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

