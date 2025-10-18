import { Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { KeysService } from './keys.service';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller('api-keys')
export class KeysController {
    constructor(private readonly keysService: KeysService) {}

    @Post('generate')
    @UseGuards(AuthGuard)
    async createKey(@Request() req) {
        const { user } = req;
        const { apiKey } = await this.keysService.generateKey(user._id);

        return {
            message: 'API key generated successfuly',
            apiKey
        }
    }

    @Delete('revoke/:keyId')
    @UseGuards(AuthGuard)
    async revokeKey(@Param('keyId') keyId: string, @Request() req) {
        const { user } = req;
        const deleted = await this.keysService.deleteKey(keyId, user._id);
        
        return {
            message: deleted ? 'API key revoked successfully' : 'API key not found',
            success: deleted
        };
    }

    @Get()
    @UseGuards(AuthGuard)
    async getUserKeys(@Request() req) {
        const { user } = req;
        const keys = await this.keysService.getUserKeys(user._id);
        
        return {
            message: 'User API keys retrieved successfully',
            keys
        };
    }
}
