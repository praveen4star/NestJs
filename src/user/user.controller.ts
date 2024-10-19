import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';

import { GetUser } from '../auth/decorator';
import { JwtStrategy } from '../auth/strategy';
@UseGuards(JwtStrategy)
@Controller('user')
export class UserController {
  @Get('me')
  getMe(@GetUser() user: User) {
    console.log(user);
    return {
      id: 1,
      username: 'user',
      email: '',
    };
  }
  @Patch()
  editUser() {
    return 'edit user';
  }
}
