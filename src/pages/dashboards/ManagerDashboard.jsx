// ManagerDashboard.jsx
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";

export function ManagerDashboard() {
  const { userProfile } = useAuth();
  return (
    <Layout title="Manager Dashboard">
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-gray-900">
          Hi {userProfile?.name?.split(" ")[0]} 👋
        </h3>
        <p className="text-gray-500 mt-1">Review pending approvals and track team tasks.</p>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Awaiting your approval", value: "4" },
          { label: "Tasks assigned by you", value: "12" },
          { label: "Overdue tasks", value: "3" },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-sm text-gray-500 mb-1">{m.label}</p>
            <p className="text-3xl font-semibold text-gray-900">{m.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h4 className="font-semibold text-gray-800 mb-4">Quick actions</h4>
        <div className="flex gap-3 flex-wrap">
          <a href="/approvals" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
            Review approvals
          </a>
          <a href="/tasks" className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            View all tasks
          </a>
          <a href="/chat" className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            Team chat
          </a>
        </div>
      </div>
    </Layout>
  );
}

export default ManagerDashboard;
