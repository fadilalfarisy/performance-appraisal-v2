import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthCredentialsDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async register(authCredentialsDto: AuthCredentialsDto) {
    const { email, password } = authCredentialsDto;
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException({
        message: 'Email already exists',
        errorCode: 'AUTH_EMAIL_ALREADY_EXISTS',
      });
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.usersService.create({
      email,
      password: hashedPassword,
    });

    return {
      message: 'User registered successfully',
      data: { id: user.id, email: user.email },
    };
  }

  async login(authCredentialsDto: AuthCredentialsDto) {
    const { email, password } = authCredentialsDto;
    const user = await this.usersService.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { email: user.email, sub: user.id };
      return {
        message: 'Login successful',
        data: {
          access_token: this.jwtService.sign(payload),
        },
      };
    } else {
      throw new UnauthorizedException({
        message: 'Please check your login credentials',
        errorCode: 'AUTH_INVALID_CREDENTIALS',
      });
    }
  }
}
