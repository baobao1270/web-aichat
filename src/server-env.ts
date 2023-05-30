export interface ServerEnv {
    MONGODB_URI: string;
    JWT_KEY: string;
}

export function getServerEnv(): ServerEnv {
    const envSecret = {
        MONGODB_URI: process.env.MONGODB_URI || '',
        JWT_KEY: process.env.JWT_KEY || 'secret-key',
    };
    if (envSecret.JWT_KEY === 'secret-key') {
        console.warn('JWT_KEY is not set, set to "secret-key", please change this in production!');
    }
    return envSecret;
}
