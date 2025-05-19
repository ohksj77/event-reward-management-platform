const authdb = db.getSiblingDB('authdb');

const users = authdb.users.insertMany([
  { loginId: "user1", password: "user1", nickname: "유저1", role: "USER" },
  { loginId: "user2", password: "user2", nickname: "유저2", role: "USER" },
  { loginId: "user3", password: "user3", nickname: "유저3", role: "USER" }
]).insertedIds;

const eventdb = db.getSiblingDB('eventdb');

const events = eventdb.events.insertMany([
  {
    name: "출석체크 이벤트",
    type: "STREAK",
    requiredCount: 7,
    metadata: {},
    endDate: new Date("2025-12-31T23:59:59.000Z")
  },
  {
    name: "몬스터 사냥 이벤트",
    type: "HUNT",
    requiredCount: 10,
    metadata: { monster: "슬라임" },
    endDate: new Date("2025-12-25T23:59:59.000Z")
  },
  {
    name: "누적 접속 이벤트",
    type: "LOGIN",
    requiredCount: 5,
    metadata: {},
    endDate: new Date("2025-12-20T23:59:59.000Z")
  }
]).insertedIds;

const rewards = eventdb.rewards.insertMany([
  { name: "출석 7일 보상", type: "ITEM", amount: 100, event: events[0] },
  { name: "몬스터 10마리 사냥 보상", type: "ITEM", amount: 200, event: events[1] },
  { name: "누적 접속 5일 보상", type: "CURRENCY", amount: 500, event: events[2] }
]).insertedIds;

const now = new Date();
const gamelogs = [];
for (let i = 0; i < 10; i++) {
  gamelogs.push({
    user: users[0],
    type: "LOGIN",
    metadata: { loginTime: new Date(now.getTime() - i * 86400000), deviceType: "PC", ipAddress: `192.168.0.${i+1}` },
    createdAt: new Date(now.getTime() - i * 86400000)
  });
}
for (let i = 0; i < 5; i++) {
  gamelogs.push({
    user: users[0],
    type: "HUNT",
    metadata: { monsterId: "Zakum", monsterName: "자쿰", monsterLevel: 120, monsterType: "Boss", reward: 50 },
    createdAt: new Date(now.getTime() - i * 3600000)
  });
}
for (let i = 0; i < 7; i++) {
  gamelogs.push({
    user: users[1],
    type: "LOGIN",
    metadata: { loginTime: new Date(now.getTime() - i * 86400000), deviceType: "Mobile", ipAddress: `10.0.0.${i+1}` },
    createdAt: new Date(now.getTime() - i * 86400000)
  });
}
for (let i = 0; i < 8; i++) {
  gamelogs.push({
    user: users[1],
    type: "HUNT",
    metadata: { monsterId: i % 2 === 0 ? "Horntail" : "Zakum", monsterName: i % 2 === 0 ? "혼테일" : "자쿰", monsterLevel: 150, monsterType: "Boss", reward: 80 },
    createdAt: new Date(now.getTime() - i * 7200000)
  });
}
for (let i = 0; i < 5; i++) {
  gamelogs.push({
    user: users[2],
    type: "LOGIN",
    metadata: { loginTime: new Date(now.getTime() - i * 86400000), deviceType: "Tablet", ipAddress: `172.16.0.${i+1}` },
    createdAt: new Date(now.getTime() - i * 86400000)
  });
}
for (let i = 0; i < 12; i++) {
  gamelogs.push({
    user: users[2],
    type: "HUNT",
    metadata: { monsterId: i % 3 === 0 ? "Horntail" : "Slime", monsterName: i % 3 === 0 ? "혼테일" : "슬라임", monsterLevel: i % 3 === 0 ? 150 : 10, monsterType: i % 3 === 0 ? "Boss" : "Normal", reward: i * 10 },
    createdAt: new Date(now.getTime() - i * 5400000)
  });
}
gamelogs.push({
  user: users[0],
  type: "INVITE",
  metadata: { invitedUserId: users[1], invitedUserName: "유저2" },
  createdAt: new Date(now.getTime() - 12 * 5400000)
});
gamelogs.push({
  user: users[0],
  type: "INVITE",
  metadata: { invitedUserId: users[2], invitedUserName: "유저3" },
  createdAt: new Date(now.getTime() - 12 * 5400000)
});
gamelogs.push({
  user: users[1],
  type: "INVITE",
  metadata: { invitedUserId: users[2], invitedUserName: "유저3" },
  createdAt: new Date(now.getTime())
});
eventdb.gamelogs.insertMany(gamelogs);

print("모든 더미 데이터 삽입 완료!");
