export type PlayerDTO = {
    id?: string;
    name: string;
    lastName: string;
    level: string;
    phone?: string;
};

export type CreatePlayerRequest = {
    player: PlayerDTO;
    answers: PlayerAnswersDTO;
}

export type PlayerAnswersDTO = {
    knowsLevel: boolean;
}