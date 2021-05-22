export interface IChangelogEntry {
    category: string;
    title: string;
    isMajor: boolean;
}

export interface IChangelog {
    id: number;
    version: string;
    entries: IChangelogEntry[]
}

export interface IV2Beatmap {
    id: number;
    mode: number;
    stars: number;
    version: string;
}

export interface IV2Beatmapset {
    id: number;
    title: string;
    artist: string;
    rankedDate: Date;
    creator: string;
    status: string;
    beatmaps: IV2Beatmap[];
}

export interface IV2News {
    id: number;
    author: string;
    image: string;
    title: string;
    link: string;
    date: Date;
}