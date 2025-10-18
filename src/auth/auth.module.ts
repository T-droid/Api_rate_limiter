import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "src/user/user.module";
import { jwtConstants } from "./constants";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.contoller";
import { UserService } from "src/user/user.service";

@Module({
    imports: [
        UserModule,
        JwtModule.register({
            global: true,
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '2h' }
        })
    ],
    providers: [AuthService, UserService],
    controllers: [AuthController],
    exports: [AuthService]
})
export class AuthModule {}