export const hasRoleAccess = (allowedRoles = []) => {
  if (typeof window === "undefined") return false;

  const token = localStorage.getItem("token");

  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    const role = payload.role?.toLowerCase()?.trim();

    if (allowedRoles.length === 0) return true;

    return allowedRoles
      .map((r) => r.toLowerCase().trim())
      .includes(role);

  } catch (error) {
    return false;
  }
};