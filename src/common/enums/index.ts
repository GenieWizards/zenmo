// NOTE: Updating the array will auto update the AuthRoles object
export const authRolesArr = ["user", "admin"] as const;

type AuthRolesTuple = typeof authRolesArr;
type AuthRolesValues = AuthRolesTuple[number];
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
