import { Gender } from "../constants/gender";
import { TeamDTO } from "./team";

export interface MatchDTO {
    date: Date;
    time: string;
    location: string;
    category: string;
    pointsDeviation: number;
    creatorPlayerId: string;
    gender: Gender;
    teams?: TeamDTO;
}
