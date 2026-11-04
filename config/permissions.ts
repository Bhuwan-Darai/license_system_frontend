// Permission catalog types and the codes used by isAllowed().
//
// The catalog itself (groups, sub groups, titles) is served by the backend at
// GET /permission, so the role form can never offer a code the backend rejects.
// Codes passed to isAllowed() are written out in full, <MODULE>_<ENTITY>_<ACTION>,
// and must match backend pkg/permissions.

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

/** One code, or a list where holding any one of them is enough. */
export type PermissionRequirement = string | readonly string[];
