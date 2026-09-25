import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  generateToken(userId: string) {
    const payload = {
      sub: userId,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    return this.generateToken(user.id);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
        where: {
        email,
        },
    });

    if (!user) {
        throw new UnauthorizedException('Email ou senha inválidos');
    }

    const passwordValid = await bcrypt.compare(
        password,
        user.password,
    );

    if (!passwordValid) {
        throw new UnauthorizedException('Email ou senha inválidos');
    }

    return this.generateToken(user.id);
    }
}