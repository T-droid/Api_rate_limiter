import { Body, Controller, Get, HttpException, HttpStatus, Post, Request, UseGuards, ValidationPipe } from "@nestjs/common";
import { CreateUserDto } from "src/user/create-user.dto";
import { UserService } from "src/user/user.service";
import { LoginBodyDto } from "./login-body.dto";
import { AuthService } from "./auth.service";
import { AuthGuard } from "src/common/guards/auth.guard";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}    
    
    @Post("register")
    async create(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
        const newUser = await this.authService.registerUser(createUserDto);

        return { message: "User registered successfully", user_id: newUser._id }
    }

    @Post("login")
    async loginUser(@Body(new ValidationPipe()) loginUserDto: LoginBodyDto): Promise<{ message: string; access_token: any }> {
        const { email, password } = loginUserDto;

        const userExists = await this.authService.getUserByEmail(email);
        if (!userExists) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        }

        const authorised = await this.authService.verifyUserPassword(password, userExists.passwordHash);
        if (!authorised) {
            throw new HttpException("Wrong credentials", HttpStatus.BAD_REQUEST)
        }

        const access_token = await this.authService.authenticateUser({ email, name: userExists.name, organization: userExists.organization })
        return { message: "User logged in successfully", access_token };
    }


    @Get('/me')
    @UseGuards(AuthGuard)
    async getMe(@Request() req) {
        return req.user;
    }
}