export interface GameResponse {
    id: number;
    code: string;
    name: string;
    description?: string;
    gameType: string;
    minPlayers: number;
    maxPlayers: number;
    maxRounds: number;
    iconUrl?: string;
    themeColor?: string;
  }