import 'dotenv/config'

interface ICLOUDINARY_CONFIG { 
    cloud_name: string, 
    api_key:  string, 
    api_secret: string 
}
interface IEnv {
    ENVIRONMENT: string,
    PORT: number,
    ALLOWED_ORIGINS: string,
    API_VERSION: string,
    API_PATH: string,
    MONGODB_URI: string,
    JWT_PRIVATE_KEY: string,
    JWT_EXPIRY: string
    
    CLOUDINARY_CONFIG: ICLOUDINARY_CONFIG
    SENDGRID_SENDER_EMAIL: string
    SENDGRID_API_KEY: string
    
}


const Env: IEnv = {
    ENVIRONMENT: process.env.ENVIRONMENT as string,
    PORT: process.env.PORT as unknown as number,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS as string,
    API_VERSION: process.env.API_VERSION as string,
    API_PATH: "/api/" + process.env.API_VERSION,
    JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY as string,
    JWT_EXPIRY: process.env.JWT_EXPIRY as string,
    MONGODB_URI: process.env.MONGODB_URI as string,
    
    CLOUDINARY_CONFIG: { 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string, 
        api_key: process.env.CLOUDINARY_API_KEY as string, 
        api_secret: process.env.CLOUDINARY_API_SECRET as string 
    },
    SENDGRID_SENDER_EMAIL: process.env.SENDGRID_SENDER_EMAIL as string,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY as string,
}

export default Env;