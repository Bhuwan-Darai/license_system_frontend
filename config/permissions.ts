// Permission catalog types and the codes used by isAllowed().
//
// The catalog itself (groups, sub groups, titles) is served by the backend at
// GET /permission, so the role form can never offer a code the backend rejects.
// The codes below must match backend pkg/permissions.

export interface Permission {
  title: string;
  sub_group: {
    title: string;
    permissions: {
      title: string;
      code: string;
    }[];
  }[];
}

const crud = <R extends string>(resource: R) =>
  ({
    LIST: `${resource}.list` as `${R}.list`,
    ADD: `${resource}.add` as `${R}.add`,
    UPDATE: `${resource}.update` as `${R}.update`,
    DELETE: `${resource}.delete` as `${R}.delete`,
  }) as const;

export const PERM = {
  DASHBOARD: {
    VIEW: "dashboard.view",
    SERVER_STATUS: "dashboard.server_status",
  },
  QUESTION_BANK_CATEGORY: crud("question_bank_category"),
  QUESTION_BANK: crud("question_bank"),
  QUESTION: crud("question"),
  EXAM: { ...crud("exam"), VISIBILITY: "exam.visibility" },
  BLOG: crud("blog"),
  BLOG_CATEGORY: crud("blog_category"),
  CAROUSEL: { ...crud("carousel"), DISPLAY: "carousel.display" },
  EMERGENCY_NUMBER: crud("emergency_number"),
  NEWS: crud("news"),
  INQUIRY: { LIST: "inquiry.list", UPDATE: "inquiry.update", DELETE: "inquiry.delete" },
  REGISTRATION: { ...crud("registration"), STATUS: "registration.status" },
  MESSAGE: { VIEW: "message.view", SEND: "message.send" },
  ISHIHARA_CATEGORY: crud("ishihara_category"),
  ISHIHARA_PLATE: crud("ishihara_plate"),
  TRAFFIC_SIGNAL_CATEGORY: crud("traffic_signal_category"),
  TRAFFIC_SIGNAL: crud("traffic_signal"),
  VEHICLE_CATEGORY: crud("vehicle_category"),
  USER: crud("user"),
  ROLE: crud("role"),
} as const;

/** One code, or a list where holding any one of them is enough. */
export type PermissionRequirement = string | readonly string[];
