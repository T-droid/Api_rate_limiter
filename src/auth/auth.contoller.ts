import { Body, Controller, Get, HttpException, HttpStatus, Post, Put, Request, Render, UseGuards, ValidationPipe, Res } from "@nestjs/common";
import { CreateUserDto } from "src/user/create-user.dto";
import { UserService } from "src/user/user.service";
import { LoginBodyDto } from "./login-body.dto";
import { AuthService } from "./auth.service";
import { AuthGuard } from "src/common/guards/auth.guard";
import { type Response } from 'express';

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    // View routes
    @Get("login")
    @Render('login')
    loginPage() {
        return {};
    }

    @Get("register")
    @Render('register')
    registerPage() {
        return {};
    }
    
    // API routes
    @Post("register")
    async create(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
        try {
            const newUser = await this.authService.registerUser(createUserDto);
            return { message: "User registered successfully", user_id: newUser._id };
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Post("login")
    async loginUser(@Body(new ValidationPipe()) loginUserDto: LoginBodyDto, @Res() res: Response) {
        try {
            const { email, password } = loginUserDto;

            const userExists = await this.authService.getUserByEmail(email);
            if (!userExists) {
                return res.redirect('/auth/login?error=User not found');
            }

            const authorised = await this.authService.verifyUserPassword(password, userExists.passwordHash);
            if (!authorised) {
                return res.redirect('/auth/login?error=Invalid credentials');
            }

            const access_token = await this.authService.authenticateUser({ 
                email, 
                name: userExists.name, 
                organization: userExists.organization,
                _id: userExists._id 
            });

            res.cookie('access_token', access_token, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax'
            })

            return res.redirect('/');
        } catch (error) {
            console.error('Login error:', error);
            return res.redirect('/auth/login?error=Login failed. Please try again.');
        }
    }

    @Get('profile')
    @UseGuards(AuthGuard)
    async getProfile(@Request() req) {
        try {
            const user = await this.authService.getUserByEmail(req.user.email);
            if (!user) {
                throw new HttpException("User not found", HttpStatus.NOT_FOUND);
            }

            return {
                email: user.email,
                name: user.name,
                organization: user.organization
            };
        } catch (error) {
            throw new HttpException("Failed to get profile", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Put('profile')
    @UseGuards(AuthGuard)
    async updateProfile(@Request() req, @Body() updateData: { name?: string; organization?: string }) {
        try {
            const user = await this.authService.updateUserProfile(req.user.email, updateData);
            return {
                message: "Profile updated successfully",
                user: {
                    email: user.email,
                    name: user.name,
                    organization: user.organization
                }
            };
        } catch (error) {
            throw new HttpException("Failed to update profile", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get("logout")
    logout(@Res() res: Response) {
        res.clearCookie('access_token');
        return res.redirect('/auth/login');
    }
}