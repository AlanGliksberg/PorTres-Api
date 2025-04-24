import { TeamDTO } from "./playerTypes";

export interface MatchDTO {
    date: Date;
    time: string;
    location: string;
    category: string;
    pointsDeviation: number;
    creatorId: string;
    teams: {
        team1: TeamDTO;
        team2: TeamDTO;
    };
}
