import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { createZodDto } from 'nestjs-zod';
import { userSchema } from '@nestject/shared';

class CreateUserDto extends createZodDto(userSchema) {}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('users')
  createUser(@Body() body: CreateUserDto) {
    return {
      message: 'User created successfully',
      data: body,
    };
  }
}
