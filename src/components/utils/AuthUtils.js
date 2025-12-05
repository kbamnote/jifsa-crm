import Cookies from "js-cookie";

// Get user role from cookies
export const getUserRole = () => {
  return Cookies.get("role") || "guest";
};

// Check if user is admin
export const isAdmin = () => {
  const role = getUserRole();
  return role === "admin";
};

// Check if user has specific role
export const hasRole = (requiredRole) => {
  const userRole = getUserRole();
  return userRole === requiredRole;
};

// Check if user has one of the specified roles
export const hasAnyRole = (roles) => {
  const userRole = getUserRole();
  return roles.includes(userRole);
};

export default {
  getUserRole,
  isAdmin,
  hasRole,
  hasAnyRole
};