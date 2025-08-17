"use client";

import { useEffect } from "react";
import { API_URL } from "./utils";

// Utility to sync session user with backend database
export const syncUserWithDatabase = async (session) => {
  if (!session?.user) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to sync user");
    }

    const result = await response.json();
    console.log("User synced with database:", result.data);
    return result.data;
  } catch (error) {
    console.error("Error syncing user with database:", error);
    return null;
  }
};

// Hook to automatically sync user on session load
export const useUserSync = (session) => {
  useEffect(() => {
    if (session?.user?.id) {
      syncUserWithDatabase(session);
    }
  }, [session?.user?.id]);
};
