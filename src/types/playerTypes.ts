import { Gender } from "../constants/gender";

export type PlayerDTO = {
    id?: string;
    firstName: string;
    lastName: string;
    level?: string;
    phone?: string;
    gender: Gender;
};

export type CreatePlayerRequest = PlayerAnswersDTO;

export type PlayerAnswersDTO = {
    level: string;
    phone?: string;
    gender: Gender;
    knowsLevel: boolean;
}