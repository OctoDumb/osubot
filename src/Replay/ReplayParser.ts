import leb from "leb";
import int64 from "int64-buffer";
import IReplay from "./Replay";
import { getAccuracy } from "../Util";
import Logger from "../Logger";

class BinaryReader {
    private raw: Buffer;
    private offset: number = 0x00;
    constructor(data: string | Buffer) {
        this.raw = typeof data == "string" ? Buffer.from(data) : data;
    }

    byte() {
        this.offset += 1;
        return this.raw.readInt8(this.offset - 1);
    }

    short() {
        this.offset += 2;
        return this.raw.readUIntLE(this.offset - 2, 2);
    }

    int() {
        this.offset += 4;
        return this.raw.readInt32LE(this.offset - 4);
    }

    long() {
        this.offset += 8;
        return new int64.Uint64LE(this.raw.slice(this.offset - 8, this.offset)).toNumber();
    }

    string() {
        if(this.raw.readInt8(this.offset) == 0x0b) {
            this.offset += 1;
            let ulString = leb.decodeUInt64(this.raw.slice(this.offset, this.offset + 8));
            let strLength = ulString.value;
            this.offset += strLength + ulString.nextIndex;
            return this.raw.slice(this.offset - strLength, this.offset).toString();
        } else {
            this.offset += 1;
            return "";
        }
    }
}

export default function parseReplay(replay: string | Buffer): IReplay {
    Logger.trace("Parsing replay");
    let reader = new BinaryReader(replay);

    let obj = {
        mode: reader.byte(),
        version: reader.int(),
        beatmapHash: reader.string(),
        player: reader.string(),
        replayHash: reader.string(),
        counts: {
            300: reader.short(),
            100: reader.short(),
            50: reader.short(),
            geki: reader.short(),
            katu: reader.short(),
            miss: reader.short()
        },
        score: reader.int(),
        combo: reader.short(),
        perfect: Boolean(reader.byte()),
        mods: reader.int()
    };

    return { ...obj, accuracy: getAccuracy(obj.mode, obj.counts) }
}