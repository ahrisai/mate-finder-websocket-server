export interface JwtUser {
  id: number;
  name: string;
}
export interface User {
  id: number;
  nickname: string;
  email: string;
  password: string;
  user_avatar?: string;
  description?: string;
  gender: string;
  birthday: string;
  valorant_data?: ValorantData;
  csgo_data?: Cs2Data;
  teams?: Team[];
  steamId?: string;
}

interface ValorantData {
  userId: number;
}

export interface Cs2Data {
  userId: number;
  steamId: string;
  matches: number;
  elo: number;
  winrate: number;
  kd: number;
  wins: number;
  hs: number;
  lvlImg: string;
  roles: string[];
  maps: string[];
}

interface Team {
  ownerId: number;
}
