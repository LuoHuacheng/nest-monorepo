import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/match_admin?schema=public";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Inserting test event data...");

  // 创建测试赛事
  const event = await prisma.event.create({
    data: {
      name: "2024北京马拉松测试赛",
      category: "马拉松赛",
      publishStatus: "published",
      startDate: new Date("2024-10-15T08:00:00Z"),
      endDate: new Date("2024-10-15T18:00:00Z"),
      registrationStartDate: new Date("2024-08-01T00:00:00Z"),
      registrationEndDate: new Date("2024-09-30T23:59:59Z"),
      province: "北京市",
      city: "北京市",
      address: "天安门广场",
      location: "天安门广场",
      tags: "马拉松/路跑/测试",
      packetPickupTime: new Date("2024-10-14T09:00:00Z"),
      packetPickupLocation: "国家体育场（鸟巢）",
      coverImages: JSON.stringify(["https://example.com/cover1.jpg"]),
      isHot: true,
      attributes: JSON.stringify(["pacer_recruitment"]),
      description: "这是一条测试赛事数据，用于验证邀请码功能。",
      maxParticipants: 10000,
      currentParticipants: 0,
    },
  });

  console.log(`Created event: ${event.name} (${event.id})`);

  // 创建赛事组别
  const groups = await Promise.all([
    prisma.registrationGroup.create({
      data: {
        eventId: event.id,
        name: "全程马拉松",
        groupType: "个人组",
        specName: "全马",
        specDescription: "全程42.195公里",
        genderLimit: "不限",
        minAge: 18,
        maxAge: 65,
        price: 200.0,
        quota: 5000,
      },
    }),
    prisma.registrationGroup.create({
      data: {
        eventId: event.id,
        name: "半程马拉松",
        groupType: "个人组",
        specName: "半马",
        specDescription: "半程21.0975公里",
        genderLimit: "不限",
        minAge: 16,
        maxAge: 65,
        price: 150.0,
        quota: 3000,
      },
    }),
    prisma.registrationGroup.create({
      data: {
        eventId: event.id,
        name: "迷你马拉松",
        groupType: "个人组",
        specName: "迷你马",
        specDescription: "迷你5公里",
        genderLimit: "不限",
        minAge: 12,
        maxAge: 70,
        price: 100.0,
        quota: 2000,
      },
    }),
  ]);

  console.log(`Created ${groups.length} registration groups:`);
  groups.forEach((group) => {
    console.log(`  - ${group.name} (${group.id})`);
  });

  console.log("\nTest event data inserted successfully!");
  console.log(`Event ID: ${event.id}`);
  console.log("You can now use this event to test invite codes.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
