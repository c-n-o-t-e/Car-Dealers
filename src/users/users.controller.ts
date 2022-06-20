import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Session,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './Dtos/create-message.dto';
import { UpdateUserDto } from './Dtos/update-user-dto';
import { UsersService } from './users.service';
import { serialize } from '../Interceptor/serialize.interceptor';
import { UserDto } from './Dtos/user-dto';
import { AuthService } from './auth.service';
import { CurrentUser } from './Decorators/create-user-decorator';
import { User } from './user.entities';
import { AuthGuard } from '../Guards/auth.guard';

@Controller('auth')
@serialize(UserDto)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Post('/signup')
  async createUser(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.signup(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Post('/signout')
  async signOut(@Session() session: any) {
    session.userId = null;
  }

  @Get('/whoami')
  @UseGuards(AuthGuard)
  whoAmI(@CurrentUser() user: User) {
    return user;
  }

  @Post('/signin')
  async logInUser(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.signin(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Get('/:id')
  findUser(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Get()
  findAllUser(@Query('email') id: string) {
    return this.usersService.find(id);
  }

  @Delete('/:id')
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Patch('/:id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    this.usersService.update(+id, body);
  }
}
