import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLE_LABELS, PERMISSIONS } from "../utils/roles";
import { logoutUser } from "../firebase/auth";
import { useNavigate } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: "⊞", permission: null },
  { label: "Tasks", path: "/tasks", icon: "✓", permission: null },
  { label: "Approvals", path: "/approvals", icon: "◎", permission: null },
  { label: "Team Chat", path: "/chat", icon: "◻", permission: null },
  { label: "Reports", path: "/reports", icon: "▦", permission: "viewReports" },
];

export default function Sidebar() {
  const { userProfile, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  const filteredNav = navItems.filter(
    (item) => !item.permission || PERMISSIONS[role]?.[item.permission]
  );

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          Team<span className="text-blue-600">ordo</span>
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">Marketing Hub</p>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
            {userProfile?.avatar || "?"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {userProfile?.name || "Loading..."}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {ROLE_LABELS[role] || role}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {filteredNav.map((item) => {
          const isActive = location.pathname.startsWith(item.path === "/dashboard" ? "/dashboard" : item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-red-600 transition-colors"
        >
          <span className="text-base w-5 text-center">→</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}
