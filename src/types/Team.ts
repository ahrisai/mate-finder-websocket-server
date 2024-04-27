import ClientUser from './ClientUser.js';
import Cs2Role from './Cs2Role.js';
import Player from './Player.js';
import { TeamRequest } from './TeamRequest.js';

export default interface Team {
  id?: number;
  game: 'cs2' | 'valorant';
  user: ClientUser;
  userId: number;
  ownerRole: string;
  name: string;
  avatar: string;
  description: string;
  public: boolean;
  neededRoles: Cs2Role[];
  teamRequests: TeamRequest[];
  members: Player[];
}
