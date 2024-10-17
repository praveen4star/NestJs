import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}
  async signup(dto: AuthDto): Promise<User> {
    // generate a password hash
    const passwordHash = await argon.hash(dto.password);
    // save the new user in the db
    try {
      const user = await this.prismaService.user.create({
        data: {
          email: dto.email,
          password: passwordHash,
        },
      });
      delete user.password;
      // return the new user
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email already exists');
        }
      }
    }
  }
  async login(dto: AuthDto): Promise<User & { token: string }> {
    const user = await this.prismaService.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }
    // compare the password hash
    const isPasswordValid = argon.verify(user.password, dto.password);
    if (!isPasswordValid) {
      throw new ForbiddenException('Invalid credentials');
    }
    delete user.password;
    const jwtPayload = { userId: user.id, email: user.email };

    return { ...user, token: await this.jwtService.signAsync(jwtPayload) };
  }
}
