import cors from "cors";
import Env from "../configs/environment_config";

class Cors {
    static corsSettings() {
        const origins = Env.ALLOWED_ORIGINS || "";

        const corsOptions = {
            origin: origins.split(", "),
            methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
            allowedHeaders: ["Date", "Content-Type", "Origin", "Authorization"],
            credentials: true,
            optionSuccessStatus: 200,
        };

        return cors(corsOptions);
        
    }
    
}

export default Cors.corsSettings;