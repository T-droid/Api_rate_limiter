import { ConflictException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "./user.schema";
import { Model } from "mongoose";
import { CreateUserDto } from "./create-user.dto";
import { PasswordUtil } from "src/utils/password.util";

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

    async createUser(user: CreateUserDto) {
        const { email, name, password, organization } = user;

        const userExists = await this.getUserByEmail(email);
        if (userExists) throw new ConflictException("This user already exists");

        const passwordHash = await PasswordUtil.hashPassword(password);

        const newUser = new this.userModel({ email, name, passwordHash, organization });
        return newUser.save();       
    }

    async getUserByEmail(email: string) {
        return await this.userModel.findOne({ email });
    }

    async verfiyUserPassword(password: string, passwordHash) {
        return await PasswordUtil.comparePassword(password, passwordHash);
    }

    async updateUserProfile(email: string, updateData: { name?: string; organization?: string }) {
        const user = await this.userModel.findOneAndUpdate(
            { email },
            { $set: updateData },
            { new: true }
        );
        
        if (!user) {
            throw new Error('User not found');
        }
        
        return user;
    }
}