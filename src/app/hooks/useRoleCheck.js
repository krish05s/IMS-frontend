"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function useRoleCheck(allowedRoles) {
  const router = useRouter();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userRole = payload.role?.toLowerCase();
      
      if (!allowedRoles.includes(userRole)) {
        router.push("/dashboard");
      } else {
        setRole(userRole);
      }
    } catch (e) {
      router.push("/");
    }
  }, [router, allowedRoles]);

  return role;
}
