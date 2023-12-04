import { HydratedDocument, Schema, model} from "mongoose";
import { MongoId } from "../interfaces/types";
import { OTP_STATUS, OTP_TYPES } from "../common/constants/app_constants";

const OTPSchema = new Schema<IOTP>({
    code: {type: String, required: true},
    type: {type: String, required: true, enum: Object.values(OTP_TYPES)},
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User'},
    status: { type: String, default: OTP_STATUS.ACTIVE, enum: Object.values(OTP_STATUS)}

},

{
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export interface IOTP {
    code: string,
    type: string,
    user: MongoId|HydratedDocument<any>,
    status: string,

    _id: MongoId|HydratedDocument<any>
}

const OTP = model<IOTP>("OTP", OTPSchema);
export default OTP;
