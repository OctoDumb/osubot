import Config from "../Config";
import AkatsukiAPI from "./Osu/Servers/Akatsuki";
import AkatsukiRelaxAPI from "./Osu/Servers/AkatsukiRelax";
import BanchoAPI from "./Osu/Servers/Bancho";
import EnjuuAPI from "./Osu/Servers/Enjuu";
import GatariAPI from "./Osu/Servers/Gatari";
import KurikkuAPI from "./Osu/Servers/Kurikku";
import RippleAPI from "./Osu/Servers/Ripple";
import { API } from "./ServerAPI";

export default class ServerAPIManager {
    private static APIs: API[] = [
        new BanchoAPI(Config.data.osu.token),
        new GatariAPI(),
        new KurikkuAPI(),
        new EnjuuAPI(),
        new RippleAPI(),
        new AkatsukiAPI(),
        new AkatsukiRelaxAPI(),
    ];

    public static get(name: string): API {
        const api = ServerAPIManager.APIs.find(api => api.name.toLowerCase() == name.toLowerCase());
        
        if (!api) throw new Error(`API with ${name} name not found`);

        return api;
    }
}