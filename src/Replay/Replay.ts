import { IHitCounts } from "../API/Osu/APIResponse";
import { Mods } from "../Util";

export default interface IReplay {
    mode: number;
    version: number;
    beatmapHash: string;
    player: string;
    replayHash: string;
    counts: IHitCounts;
    score: number;
    combo: number;
    perfect: boolean;
    mods: Mods;
    accuracy: number;
}