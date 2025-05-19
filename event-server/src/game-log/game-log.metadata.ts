export interface MonsterMetadata {
  monsterId: string;
  monsterName: string;
  monsterLevel: number;
  monsterType: string;
  reward: number;
}

export interface InviteMetadata {
  invitedUserId: string;
  invitedUserName: string;
}

export interface LoginMetadata {
  loginTime: Date;
}
