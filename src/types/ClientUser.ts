import Team from './Team.js';

export default interface ClientUser {
  id: number;
  nickname: string;
  age: number;
  user_avatar?: string;
  description?: string;
  gender: string;
  birthday: string;

  teams?: Team[];
}
