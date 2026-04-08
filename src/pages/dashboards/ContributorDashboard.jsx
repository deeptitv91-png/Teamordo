import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import { ROLE_LABELS } from "../../utils/roles";

function SimpleDashboard({ title, metrics, actions }) {
  const { userProfile, role } = useAuth();
  return (
    <Layout title={title}>
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-gray-900">
          Hi {userProfile?.name?.split(" ")[0]} 👋
        </h3>
        <p className="text-gray-500 mt-1">{ROLE_LABELS[role]}</p>
      </div>
      <div className={`grid grid-cols-${metrics.length} gap-4 mb-8`}>
        {metrics.map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-sm text-gray-500 mb-1">{m.label}</p>
            <p className="text-3xl font-semibold text-gray-900">{m.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h4 className="font-semibold text-gray-800 mb-4">Quick actions</h4>
        <div className="flex gap-3 flex-wrap">
          {actions.map((a) => (
            <a
              key={a.label}
              href={a.href}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                a.primary
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {a.label}
            </a>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export function PerfHeadDashboard() {
  return (
    <SimpleDashboard
      title="Performance Dashboard"
      metrics={[
        { label: "Active campaigns", value: "3" },
        { label: "Team tasks", value: "8" },
        { label: "Approvals needed", value: "2" },
      ]}
      actions={[
        { label: "View approvals", href: "/approvals", primary: true },
        { label: "Tasks", href: "/tasks", primary: false },
        { label: "Reports", href: "/reports", primary: false },
      ]}
    />
  );
}

export function CreativeHeadDashboard() {
  return (
    <SimpleDashboard
      title="Creative Dashboard"
      metrics={[
        { label: "Assets in review", value: "4" },
        { label: "Creative tasks", value: "6" },
        { label: "Approved this week", value: "7" },
      ]}
      actions={[
        { label: "Review assets", href: "/approvals", primary: true },
        { label: "Tasks", href: "/tasks", primary: false },
        { label: "Team chat", href: "/chat", primary: false },
      ]}
    />
  );
}

export function ContributorDashboard() {
  return (
    <SimpleDashboard
      title="My Dashboard"
      metrics={[
        { label: "My tasks", value: "5" },
        { label: "Due this week", value: "2" },
        { label: "Submitted for approval", value: "1" },
      ]}
      actions={[
        { label: "My tasks", href: "/tasks", primary: true },
        { label: "Submit for approval", href: "/approvals", primary: false },
        { label: "Team chat", href: "/chat", primary: false },
      ]}
    />
  );
}

export default ContributorDashboard;
