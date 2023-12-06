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
    JWT_PRIVATE_KEY: string,
    JWT_EXPIRY: string
    
    CLOUDINARY_CONFIG: ICLOUDINARY_CONFIG
    SENDGRID_SENDER_EMAIL: string
    SENDGRID_API_KEY: string
    
    SUPER_ADMIN_FIRST_NAME: string,
    SUPER_ADMIN_MIDDLE_NAME: string,
    SUPER_ADMIN_LAST_NAME: string,
    SUPER_ADMIN_EMAIL: string,
    SUPER_ADMIN_PHONE: string,
    SUPER_ADMIN_GENDER: string,

    DB_HOST: string,
    DB_USER: string,
    DB_PASSWORD: string,
    DB_NAME: string,
    DB_PORT: number,
}


const Env: IEnv = {
    ENVIRONMENT: process.env.ENVIRONMENT as string,
    PORT: process.env.PORT as unknown as number,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS as string,
    API_VERSION: process.env.API_VERSION as string,
    API_PATH: "/api/" + process.env.API_VERSION,
    JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY as string,
    JWT_EXPIRY: process.env.JWT_EXPIRY as string,
    
    CLOUDINARY_CONFIG: { 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string, 
        api_key: process.env.CLOUDINARY_API_KEY as string, 
        api_secret: process.env.CLOUDINARY_API_SECRET as string 
    },
    SENDGRID_SENDER_EMAIL: process.env.SENDGRID_SENDER_EMAIL as string,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY as string,

    SUPER_ADMIN_FIRST_NAME: process.env.SUPER_ADMIN_FIRST_NAME as string,
    SUPER_ADMIN_MIDDLE_NAME: process.env.SUPER_ADMIN_MIDDLE_NAME as string,
    SUPER_ADMIN_LAST_NAME: process.env.SUPER_ADMIN_LAST_NAME as string,
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,
    SUPER_ADMIN_PHONE: process.env.SUPER_ADMIN_PHONE as string,
    SUPER_ADMIN_GENDER: process.env.SUPER_ADMIN_GENDER as string,

    DB_HOST: process.env.DB_HOST as string,
    DB_USER: process.env.DB_USER as string,
    DB_PASSWORD: process.env.DB_PASSWORD as string,
    DB_NAME: process.env.DB_NAME as string,
    DB_PORT: process.env.DB_PORT as unknown as number,
    
}

export default Env;