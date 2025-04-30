import { GENDER } from "../constants/gender";
import { TeamDTO } from "./team";

export interface MatchDTO {
    date: Date;
    time: string;
    location: string;
    category: string;
    pointsDeviation: number;
    creatorPlayerId: string;
    gender: GENDER;
    teams?: TeamDTO;
}

export interface GetOpenMatchesRequest {
    gender?: GENDER;
    page: string;
    pageSize: string;
}
