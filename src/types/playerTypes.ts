export type TeamDTO = {
    teamNumber: number;
    players: PlayerDTO[];
};

export type PlayerDTO = {
    id?: string;
    name: string;
    lastName: string;
    level: string;
    phone?: string;
};