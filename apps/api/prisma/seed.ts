import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcrypt";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/match_admin?schema=public";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const adminRole = await prisma.sysRole.upsert({
    where: { code: "admin" },
    update: {},
    create: {
      name: "超级管理员",
      code: "admin",
      description: "拥有所有权限",
    },
  });

  const hashedPassword = await bcrypt.hash("admin123", 10);
  const adminUser = await prisma.sysUser.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      name: "管理员",
    },
  });

  await prisma.sysUserRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id },
  });

  const permissionCodes = [
    "user:list", "user:create", "user:update", "user:delete",
    "role:list", "role:create", "role:update", "role:delete", "role:assign",
    "permission:list", "permission:create", "permission:update", "permission:delete",
    "menu:list", "menu:create", "menu:update", "menu:delete",
    "dict:list", "dict:create", "dict:update", "dict:delete",
    "log:list",
    "event:list", "event:create", "event:update", "event:delete",
    "registration-card:list", "registration-card:create", "registration-card:update", "registration-card:delete",
    "order:list", "order:create", "order:refund",
    "organizer:list", "organizer:create", "organizer:update", "organizer:delete",
    "athletic-center:list", "athletic-center:create", "athletic-center:update", "athletic-center:delete",
    "pacer:list", "pacer:create", "pacer:approve", "pacer:suspend", "pacer:revoke", "pacer:delete", "pacer:update", "pacer:assign",
    "notification:list", "notification:create",
    "client-config:list", "client-config:update",
  ];

  const permissionNames: Record<string, string> = {
    "user:list": "用户列表", "user:create": "创建用户", "user:update": "更新用户", "user:delete": "删除用户",
    "role:list": "角色列表", "role:create": "创建角色", "role:update": "更新角色", "role:delete": "删除角色", "role:assign": "分配权限",
    "permission:list": "权限列表", "permission:create": "创建权限", "permission:update": "更新权限", "permission:delete": "删除权限",
    "menu:list": "菜单列表", "menu:create": "创建菜单", "menu:update": "更新菜单", "menu:delete": "删除菜单",
    "dict:list": "字典列表", "dict:create": "创建字典", "dict:update": "更新字典", "dict:delete": "删除字典",
    "log:list": "日志列表",
    "event:list": "赛事列表", "event:create": "创建赛事", "event:update": "更新赛事", "event:delete": "删除赛事",
    "registration-card:list": "报名卡列表", "registration-card:create": "创建报名卡", "registration-card:update": "更新报名卡", "registration-card:delete": "删除报名卡",
    "order:list": "订单列表", "order:create": "创建订单", "order:refund": "订单退款",
    "organizer:list": "组委会列表", "organizer:create": "创建组委会", "organizer:update": "更新组委会", "organizer:delete": "删除组委会",
    "athletic-center:list": "田管中心列表", "athletic-center:create": "创建田管中心", "athletic-center:update": "更新田管中心", "athletic-center:delete": "删除田管中心",
    "pacer:list": "配速员列表", "pacer:create": "创建配速员", "pacer:approve": "审核配速员", "pacer:suspend": "暂停配速员", "pacer:revoke": "解除配速员", "pacer:delete": "删除配速员", "pacer:update": "更新配速员", "pacer:assign": "分配配速员",
    "notification:list": "通知列表", "notification:create": "创建通知",
    "client-config:list": "配置列表", "client-config:update": "更新配置",
  };

  for (const code of permissionCodes) {
    const perm = await prisma.sysPermission.upsert({
      where: { code },
      update: {},
      create: { name: permissionNames[code] || code, code },
    });

    await prisma.sysRolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  const menus = [
    { name: "Dashboard", path: "/", icon: "dashboard", sort: 0, type: "menu" },
    { name: "赛事管理", path: "/events", icon: "event", sort: 1, type: "dir" },
    { name: "赛事列表", path: "/events", icon: "list", sort: 1, type: "menu", parentId: null, permissionCode: "event:list" },
    { name: "订单管理", path: "/orders", icon: "order", sort: 2, type: "dir" },
    { name: "组委会", path: "/organizers", icon: "organizer", sort: 3, type: "menu", permissionCode: "organizer:list" },
    { name: "田管中心", path: "/athletic-centers", icon: "athletic", sort: 4, type: "menu", permissionCode: "athletic-center:list" },
    { name: "配速员管理", path: "/pacers", icon: "pacer", sort: 5, type: "dir" },
    { name: "用户管理", path: "/users", icon: "user", sort: 6, type: "menu", permissionCode: "user:list" },
    { name: "角色管理", path: "/roles", icon: "role", sort: 7, type: "menu", permissionCode: "role:list" },
    { name: "系统配置", path: "/settings", icon: "settings", sort: 8, type: "dir" },
  ];

  for (const menu of menus) {
    await prisma.sysMenu.create({ data: menu as any }).catch(() => {});
  }

  console.log("Seed completed!");
  console.log("Admin user: admin / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
