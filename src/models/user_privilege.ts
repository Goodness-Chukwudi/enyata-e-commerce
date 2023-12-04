import { Schema, model} from "mongoose";
import { ITEM_STATUS } from "../common/constants/app_constants";
import { MongoId } from "../interfaces/types";

const UserPrivilegeSchema = new Schema<IUserPrivilege>({
    user: { type: Schema.Types.ObjectId, ref: "user"},
    role: { type: String, required: true},
    created_by: { type: Schema.Types.ObjectId, ref: "user"},
    updated_by: { type: Schema.Types.ObjectId, ref: "user" },
    status: { type: String, default: ITEM_STATUS.ACTIVE, enum: Object.values(ITEM_STATUS) }
}, 
{
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export interface IUserPrivilege {
    user: any,
    role: string,
    status: string,
    created_by: any,
    updated_by: any,
    
    _id: any
}

const UserPrivilege = model<IUserPrivilege>("user_privilege", UserPrivilegeSchema);
export default UserPrivilege;
