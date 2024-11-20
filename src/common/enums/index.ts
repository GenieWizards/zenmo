// NOTE: Updating the array will auto update the AuthRoles object
export const authRolesArr = ["user", "admin"] as const;

type AuthRolesValues = (typeof authRolesArr)[number];
type AuthRolesType = {
  [K in Uppercase<AuthRolesValues>]: Lowercase<K>;
};

export const AuthRoles = authRolesArr.reduce(
  (acc, role) => ({
    ...acc,
    [role.toUpperCase()]: role,
  }),
  {} as AuthRolesType,
);

export type UpperCaseAuthRole = keyof typeof AuthRoles;
export type AuthRole = (typeof AuthRoles)[UpperCaseAuthRole];

export const groupStatusArr = ["settled", "unsettled"] as const;

type GroupStatusValues = (typeof groupStatusArr)[number];
type GroupStatusType = {
  [K in Uppercase<GroupStatusValues>]: Lowercase<K>;
};

export const GroupStatus = groupStatusArr.reduce(
  (acc, status) => ({
    ...acc,
    [status.toUpperCase()]: status,
  }),
  {} as GroupStatusType,
);

export const splitTypeArr = ["even", "uneven", "proportional"] as const;

type SplitTypeValues = (typeof splitTypeArr)[number];
type SplitTypeType = {
  [K in Uppercase<SplitTypeValues>]: Lowercase<K>;
};

export const SplitType = splitTypeArr.reduce(
  (acc, type) => ({
    ...acc,
    [type.toUpperCase()]: type,
  }),
  {} as SplitTypeType,
);

export const activityTypeArr = [
  "category_created",
  "category_updated",
  "category_deleted",
  "group_member_added",
  "group_member_removed",
  "expense_added",
  "expense_updated",
  "expense_deleted",
] as const;

export type ActivityTypeValues = (typeof activityTypeArr)[number];
type ActivityTypeType = {
  [K in Uppercase<ActivityTypeValues>]: Lowercase<K>;
};

export const ActivityType = activityTypeArr.reduce(
  (acc, type) => ({
    ...acc,
    [type.toUpperCase()]: type,
  }),
  {} as ActivityTypeType,
);
