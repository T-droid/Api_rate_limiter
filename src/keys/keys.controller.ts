import { Controller, Delete, Get, Param, Post, Request, UseGuards, Render } from '@nestjs/common';
import { KeysService } from './keys.service';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller('keys')
export class KeysController {
    constructor(private readonly keysService: KeysService) {}

    @Get('')
    @UseGuards(AuthGuard)
    @Render('api-keys')
    getApiKeysPage(@Request() req) {
        return { 
            user: req.user,
            title: 'API Keys'
        };
    }

    @Post('api/generate')
    @UseGuards(AuthGuard)
    async createKey(@Request() req) {
        const { user } = req;
        const { apiKey } = await this.keysService.generateKey(user._id);

        return {
            message: 'API key generated successfuly',
            apiKey
        }
    }

    @Delete('api/revoke/:keyId')
    @UseGuards(AuthGuard)
    async revokeKey(@Param('keyId') keyId: string, @Request() req) {
        const { user } = req;
        const deleted = await this.keysService.deleteKey(keyId, user._id);
        
        return {
            message: deleted ? 'API key revoked successfully' : 'API key not found',
            success: deleted
        };
    }

    @Get('api/list')
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
