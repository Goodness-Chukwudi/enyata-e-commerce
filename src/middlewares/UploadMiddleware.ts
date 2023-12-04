import { NextFunction, Request, Response, Router } from "express";
import BaseRouterMiddleware from "./BaseRouterMiddleware";
import AppUtils from "../common/utils/AppUtils";
import path from "path";
import { UPLOADED_FILE, USER_LABEL } from "../common/constants/app_constants";


export class UploadMiddleware extends BaseRouterMiddleware {

    appUtils: AppUtils;

    constructor(appRouter: Router) {
        super(appRouter);
    }

    protected initServices() {
        this.appUtils = new AppUtils();
    }

    public uploadPhoto = async (req: Request, res: Response, next: NextFunction) => {
        try {
            //@ts-ignore
            let file: any = req.files?.photo;  
            if (!file) {
                const error = new Error("No file attached");
                return this.sendErrorResponse(res, error, this.errorResponseMessage.FILE_NOT_FOUND, 400);
            }
    
            file = await this.appUtils.resizeImage(file, 1000, 100);
            let fileName = req.params.id + "_" + Date.now();
            const photo = await this.appUtils.uploadFile(file.tempFilePath, fileName);
            
            const resizedFile = await this.appUtils.resizeImage(file, 250, 80);
            fileName = fileName + "_thumbnail";
            const thumbnail = await this.appUtils.uploadFile(resizedFile.tempFilePath, fileName);

            const uploadedPhoto = {
                url: photo.secure_url,
                thumbnail_url: thumbnail.secure_url,
                mime_type: file.mimetype,
                extension: path.extname(file.name),
                size: photo.bytes,
                public_id: photo.public_id
            }
            this.requestService.addDataToState(UPLOADED_FILE, uploadedPhoto);

            next();
        } catch (error: any) {
            return this.sendErrorResponse(res, error, this.errorResponseMessage.FILE_UPLOAD_ERROR, 500);
        }
    }
}

export default UploadMiddleware;