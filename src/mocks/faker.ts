import { fakerZH_CN as faker } from "@faker-js/faker";

/**
 * 生成 mock 用户数据
 */
export function generateUser(
  overrides?: Partial<{
    id: string;
    name: string;
    phone: string;
    gender: "male" | "female";
    email: string;
    avatar: string;
  }>,
) {
  const gender = faker.helpers.arrayElement(["male", "female"] as const);
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName({ sex: gender === "male" ? "male" : "female" }),
    phone: faker.phone.number({ style: "national" }),
    gender,
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    ...overrides,
  };
}

/**
 * 生成 mock 事件数据
 */
export function generateEvent(
  overrides?: Partial<{
    id: string;
    name: string;
    location: string;
    date: string;
    status: string;
  }>,
) {
  return {
    id: faker.string.uuid(),
    name: `${faker.location.city()}${faker.helpers.arrayElement(["马拉松", "半程马拉松", "越野赛", "欢乐跑"])}`,
    location: faker.location.city(),
    date: faker.date.future().toISOString().split("T")[0],
    status: faker.helpers.arrayElement(["upcoming", "ongoing", "completed", "cancelled"]),
    ...overrides,
  };
}

/**
 * 生成 mock 订单数据
 */
export function generateOrder(
  overrides?: Partial<{
    id: string;
    orderNo: string;
    eventName: string;
    userName: string;
    amount: number;
    status: string;
    createdAt: string;
  }>,
) {
  return {
    id: faker.string.uuid(),
    orderNo: faker.string.alphanumeric(12).toUpperCase(),
    eventName: `${faker.location.city()}马拉松`,
    userName: faker.person.fullName(),
    amount: faker.number.int({ min: 100, max: 500 }),
    status: faker.helpers.arrayElement(["pending", "paid", "completed", "refunded", "cancelled"]),
    createdAt: faker.date.past().toISOString().split("T")[0],
    ...overrides,
  };
}

/**
 * 批量生成数据
 */
export function generateMany<T>(generator: () => T, count: number): T[] {
  return Array.from({ length: count }, generator);
}
