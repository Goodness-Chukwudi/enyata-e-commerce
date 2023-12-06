import joi, { Extension, Root } from "joi";

export interface IResponseMessage {
    response_code: number;
    message: string;
}

export interface TransactionData {
    condition?: string,
    queryType?: "save"|"update",
    name: string,
    data: Record<string, string|boolean|number>
}

export interface IServiceResponse {
    data: any,
    error: IServiceError|undefined
}

export interface IDbQuery {
    condition: string,
    values: any[]
}

export interface PopulateTables {
    name: string,
    condition: string
}

interface IServiceError {
    service_error: Error,
    responseMessage: IResponseMessage,
    statusCode: number
}

interface IObjectIdExtension extends Extension {
    type: 'string',
    base: joi.StringSchema
    messages: {'string.objectId': string},
    rules: {
        objectId: { validate(value:string, helpers:any): any }
    }
}
export declare const JoiExtensionFactory: (joi: Root) => IObjectIdExtension;
