import {
  Controller,
  Get,
  Request as NestRequest,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
  };
};

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * No id parameter anywhere: `req.user` is written by `JwtStrategy.validate`
   * from the bearer token, so the caller can only ever read themselves.
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Consultar o perfil do usuário autenticado' })
  getMe(@NestRequest() req: AuthenticatedRequest) {
    return this.usersService.getProfile(req.user.id);
  }
}
