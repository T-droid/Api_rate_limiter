import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "src/user/create-user.dto";
import { UserService } from "src/user/user.service";
import { JwtService } from "@nestjs/jwt"

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private jwtService: JwtService
    ) {}

    async registerUser(user: CreateUserDto) {
        return await this.userService.createUser(user);
    }

    async getUserByEmail(email: string) {
        return this.userService.getUserByEmail(email);
    }

    async verifyUserPassword(password, passwordHash) {
        return this.userService.verfiyUserPassword(password, passwordHash);
    }

    async authenticateUser(payload: { email: string; name: string; organization: string; _id?: any }) {
        return await this.jwtService.signAsync(payload);
    }

    async updateUserProfile(email: string, updateData: { name?: string; organization?: string }) {
        return await this.userService.updateUserProfile(email, updateData);
    }
}