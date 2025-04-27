import { PlayerDTO } from "./playerTypes";

export interface MatchDTO {
    date: Date;
    time: string;
    location: string;
    category: string;
    pointsDeviation: number;
    creatorPlayerId: string;
    teams: {
        team1: PlayerDTO[];
        team2: PlayerDTO[];
    };
}
