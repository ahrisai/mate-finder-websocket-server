import ClientUser from './ClientUser.js';
import Team from './Team.js';

export interface TeamRequest {
  id?: number;
  teamId?: number;
  team?: Team;
  toUserId: number;
  user?: ClientUser;
  roleId: number;
  isFromTeam: boolean;
}
