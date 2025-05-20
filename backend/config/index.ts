import { Config } from "../interfaces/config.interface";
import dotenv from "dotenv";

dotenv.config();

export const config: Config = {
    port: Number(process.env.PORT) || 3000,
    apiVersion: process.env.API_VERSION || "1",
    nodeEnv: process.env.NODE_ENV || "development",
    mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/envshare",
    corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
    jwt: {
        accessToken: {
            secret: process.env.JWT_ACCESS_SECRET || "access_secret_key_change_in_production",
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m"
        },
        refreshToken: {
            secret: process.env.JWT_REFRESH_SECRET || "refresh_secret_key_change_in_production",
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d"
        }
    }
}