import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PERMISSIONS } from "../utils/roles";

export default function ProtectedRoute({ children, requiredPermission = null, allowedRoles = null }) {
  const { user, role } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  // Check specific role list
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check permission flag
  if (requiredPermission && !PERMISSIONS[role]?.[requiredPermission]) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
