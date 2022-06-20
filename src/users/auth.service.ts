import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async signup(email: string, password: string) {
    const user = await this.userService.find(email);
    if (user.length) {
      throw new BadRequestException('email already exist');
    }

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    const result = salt + '.' + hash.toString('hex');
    const newUser = await this.userService.create(email, result);

    return newUser;
  }

  async signin(email: string, password: string) {
    const [user] = await this.userService.find(email);
    if (!user) {
      throw new NotFoundException('incorrect email');
    }

    const userPassword = user.password.toString();
    const [salt] = userPassword.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const result = salt + '.' + hash.toString('hex');

    if (result !== userPassword) {
      throw new NotFoundException('incorrect password');
    }

    console.log('works');
    return user;
  }
}
