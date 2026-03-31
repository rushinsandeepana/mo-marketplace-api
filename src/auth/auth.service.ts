import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginResponse, UserResponse } from './types/auth-response.types';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserResponse | null> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        return null;
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return null;
      }
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result as UserResponse;
    } catch (error) {
      throw new UnauthorizedException('Validation failed');
    }
  }

  async login(user: UserResponse): Promise<LoginResponse> {
    try {
      const payload = { email: user.email, sub: user.id };
      const accessToken = this.jwtService.sign(payload);
      const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '7d');
      
      return {
        access_token: accessToken,
        expires_in: expiresIn,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Login failed');
    }
  }

  async register(createAuthDto: CreateAuthDto): Promise<UserResponse> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: createAuthDto.email },
      });

      if (existingUser) {
        throw new UnauthorizedException('Email already exists');
      }

      const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);
      
      const user = this.userRepository.create({
        name: createAuthDto.name,
        email: createAuthDto.email,
        password: hashedPassword,
      });

      const savedUser = await this.userRepository.save(user);
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = savedUser;
      return result as UserResponse;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Registration failed');
    }
  }
}
