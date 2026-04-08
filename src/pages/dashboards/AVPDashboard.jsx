import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";

const metrics = [
  { label: "Active campaigns", value: "5", delta: "+2 this month", up: true },
  { label: "Pending approvals", value: "6", delta: "2 urgent", up: false },
  { label: "Tasks in progress", value: "18", delta: "8 overdue", up: false },
  { label: "Team members", value: "10", delta: "All active", up: true },
];

const recentApprovals = [
  { title: "Instagram reel – Product launch", by: "Tanya R.", status: "urgent", statusLabel: "Urgent" },
  { title: "Blog post – Summer SEO", by: "Meera P.", status: "review", statusLabel: "In review" },
  { title: "Google Ads creative – Q2", by: "Nisha S.", status: "approved", statusLabel: "Approved" },
];

const statusStyles = {
  urgent: "bg-red-100 text-red-700",
  review: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
};

export default function AVPDashboard() {
  const { userProfile } = useAuth();

  return (
    <Layout title="Overview">
      {/* Welcome */}
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-gray-900">
          Good morning, {userProfile?.name?.split(" ")[0]} 👋
        </h3>
        <p className="text-gray-500 mt-1">Here's what's happening with your marketing team today.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-sm text-gray-500 mb-1">{m.label}</p>
            <p className="text-3xl font-semibold text-gray-900">{m.value}</p>
            <p className={`text-xs mt-1 ${m.up ? "text-green-600" : "text-red-500"}`}>
              {m.delta}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending approvals */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-800">Pending approvals</h4>
            <a href="/approvals" className="text-xs text-blue-600 hover:underline">View all</a>
          </div>
          <div className="space-y-3">
            {recentApprovals.map((a) => (
              <div key={a.title} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{a.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">By {a.by}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[a.status]}`}>
                  {a.statusLabel}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Department status */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Department status</h4>
          <div className="space-y-4">
            {[
              { dept: "Performance Marketing", progress: 80, color: "bg-amber-400" },
              { dept: "SEO", progress: 55, color: "bg-teal-400" },
              { dept: "Social Media", progress: 70, color: "bg-blue-400" },
              { dept: "Creative", progress: 65, color: "bg-orange-400" },
              { dept: "Content", progress: 90, color: "bg-green-400" },
              { dept: "Video Production", progress: 40, color: "bg-gray-400" },
            ].map((d) => (
              <div key={d.dept}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{d.dept}</span>
                  <span className="text-gray-400 font-medium">{d.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`${d.color} h-1.5 rounded-full`}
                    style={{ width: `${d.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
