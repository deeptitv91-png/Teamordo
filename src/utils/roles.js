export const ROLES = {
  AVP: "avp",
  MANAGER: "manager",
  PERF_HEAD: "perf_head",
  CREATIVE_HEAD: "creative_head",
  CONTENT_WRITER: "content_writer",
  GRAPHIC_DESIGNER: "graphic_designer",
  VIDEO_SHOOTING: "video_shooting",
  VIDEO_EDITING: "video_editing",
  SEO: "seo",
  SOCIAL_MEDIA: "social_media",
};

export const ROLE_LABELS = {
  avp: "AVP Marketing",
  manager: "Assistant Manager",
  perf_head: "Performance Marketing Head",
  creative_head: "Creative Head",
  content_writer: "Content Writer",
  graphic_designer: "Graphic Designer",
  video_shooting: "Video Production – Shooting",
  video_editing: "Video Production – Editing",
  seo: "SEO Specialist",
  social_media: "Social Media Manager",
};

export const DEPARTMENTS = {
  avp: "leadership",
  manager: "leadership",
  perf_head: "performance",
  seo: "performance",
  social_media: "performance",
  creative_head: "creative",
  graphic_designer: "creative",
  content_writer: "content",
  video_shooting: "production",
  video_editing: "production",
};

export const DEPARTMENT_LABELS = {
  leadership: "Leadership",
  performance: "Performance & Growth",
  creative: "Creative",
  content: "Content",
  production: "Video Production",
};

export const PERMISSIONS = {
  avp: {
    viewAll: true,
    createTasks: true,
    approveDept: true,
    finalApprove: true,
    viewReports: true,
    manageUsers: true,
  },
  manager: {
    viewAll: true,
    createTasks: true,
    approveDept: true,
    finalApprove: false,
    viewReports: true,
    manageUsers: false,
  },
  perf_head: {
    viewAll: false,
    createTasks: true,
    approveDept: true,
    finalApprove: false,
    viewReports: true,
    manageUsers: false,
  },
  creative_head: {
    viewAll: false,
    createTasks: true,
    approveDept: true,
    finalApprove: false,
    viewReports: true,
    manageUsers: false,
  },
  content_writer: {
    viewAll: false,
    createTasks: false,
    approveDept: false,
    finalApprove: false,
    viewReports: false,
    manageUsers: false,
  },
  graphic_designer: {
    viewAll: false,
    createTasks: false,
    approveDept: false,
    finalApprove: false,
    viewReports: false,
    manageUsers: false,
  },
  video_shooting: {
    viewAll: false,
    createTasks: false,
    approveDept: false,
    finalApprove: false,
    viewReports: false,
    manageUsers: false,
  },
  video_editing: {
    viewAll: false,
    createTasks: false,
    approveDept: false,
    finalApprove: false,
    viewReports: false,
    manageUsers: false,
  },
  seo: {
    viewAll: false,
    createTasks: false,
    approveDept: false,
    finalApprove: false,
    viewReports: false,
    manageUsers: false,
  },
  social_media: {
    viewAll: false,
    createTasks: false,
    approveDept: false,
    finalApprove: false,
    viewReports: false,
    manageUsers: false,
  },
};

export const APPROVAL_CHAIN = {
  // Who approves assets from each role
  content_writer: ["manager", "avp"],
  graphic_designer: ["creative_head", "manager", "avp"],
  video_shooting: ["creative_head", "manager"],
  video_editing: ["creative_head", "manager", "avp"],
  seo: ["perf_head", "manager"],
  social_media: ["perf_head", "manager", "avp"],
};

export const ROLE_COLORS = {
  avp: { bg: "bg-purple-100", text: "text-purple-800", dot: "bg-purple-500" },
  manager: { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500" },
  perf_head: { bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500" },
  creative_head: { bg: "bg-coral-100", text: "text-orange-800", dot: "bg-orange-500" },
  content_writer: { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-500" },
  graphic_designer: { bg: "bg-pink-100", text: "text-pink-800", dot: "bg-pink-500" },
  video_shooting: { bg: "bg-gray-100", text: "text-gray-800", dot: "bg-gray-500" },
  video_editing: { bg: "bg-gray-100", text: "text-gray-800", dot: "bg-gray-500" },
  seo: { bg: "bg-teal-100", text: "text-teal-800", dot: "bg-teal-500" },
  social_media: { bg: "bg-teal-100", text: "text-teal-800", dot: "bg-teal-500" },
};
