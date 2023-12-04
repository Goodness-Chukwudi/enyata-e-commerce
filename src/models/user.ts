import { HydratedDocument, Schema, model} from "mongoose";
import { USER_STATUS } from "../common/constants/app_constants";
import { MongoId } from "../interfaces/types";

const UserSchema = new Schema<IUser>({
        email: { type: String, lowercase: true, unique: true, index: true, trim: true, required: [true, "email is required"]},
        username: { type: String, unique: true, index: true, trim: true, required: [true, "username is required"]},
        phone: { type: String, unique: true, trim: true},
        status: { type: String, default: USER_STATUS.PENDING, enum: Object.values(USER_STATUS) },
        require_new_password: {type: Boolean, default: false}
    },
    {
        timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}
    });

export interface IUser {
    username: string,
    email: string,
    phone: string,
    status: string,
    require_new_password: boolean,
    
    _id: MongoId|HydratedDocument<any>
}

const User = model<IUser>("user", UserSchema);
export default User;
