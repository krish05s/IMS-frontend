"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function useRoleCheck(allowedRoles) {
  const router = useRouter();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // If no token
    if (!token) {
      router.push("/");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      // Check token expiry
      const currentTime = Date.now() / 1000;

      if (payload.exp < currentTime) {
        localStorage.removeItem("token");
        router.push("/");
        return;
      }

      const userRole = payload.role?.toLowerCase();

      // Check role access
      if (!allowedRoles.includes(userRole)) {
        router.push("/dashboard");
      } else {
        setRole(userRole);
      }
    } catch (error) {
      localStorage.removeItem("token");
      router.push("/");
    }
  }, [router, allowedRoles]);

  return role;
}