import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';

import { GetUser } from 'src/auth/decorator';
import { JwtStrategy } from 'src/auth/strategy';

@Controller('user')
export class UserController {
  @UseGuards(JwtStrategy)
  @Get('me')
  getMe(@GetUser() user: User) {
    console.log(user);
    return {
      id: 1,
      username: 'user',
      email: '',
    };
  }
}
