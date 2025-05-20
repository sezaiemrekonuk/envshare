export interface Config { 
    port: number;
    apiVersion: string;
    nodeEnv: string;
    mongoUri: string;
    corsOrigin: string;
    jwt: {
        accessToken: {
            secret: string;
            expiresIn: string;
        };
        refreshToken: {
            secret: string;
            expiresIn: string;
        };
    };
}