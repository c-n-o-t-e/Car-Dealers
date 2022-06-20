import { Test } from '@nestjs/testing';
import { getMaxListeners } from 'process';
import { AuthService } from './auth.service';
import { User } from './user.entities';
import { UsersService } from './users.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('Auth Service', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];

    fakeUsersService = {
      find: (email: string) => {
        const filteredUser = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUser);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;

        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('can create a new user with a salt and hashed password', async () => {
    const user = await service.signup('asdf@gmail.com', 'asdf');
    console.log(user.password);

    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');

    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('it throws error with email in use', async () => {
    await service.signup('asdf@asdf.com', 'asdf');

    await expect(service.signup('asdf@asdf.com', 'asdf')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('it throws error if signin email is wrong', async () => {
    await expect(service.signin('asdf@asdf.com', 'asdf')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('it throws error if signin email is correct but password  is wrong', async () => {
    await service.signup('asdf@asdf.com', 'asdf');
    await expect(service.signin('asdf@asdf.com', 'asdkf')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('asdf@asdf.com', 'asdf');
    await service.signin('asdf@asdf.com', 'asdf');
  });
});
