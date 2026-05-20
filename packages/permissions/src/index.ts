export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}

export const roleHierarchy: Record<Role, number> = {
  [Role.ADMIN]: 100,
  [Role.USER]: 10,
};

export function hasRole(userRole: Role, required: Role): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[required];
}
