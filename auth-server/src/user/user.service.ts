import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Document } from 'mongoose';
import { User } from './user.schema';
import { RegisterDto } from '../auth/dto/register.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async create(registerDto: RegisterDto): Promise<User & Document> {
    const hash = await bcrypt.hash(registerDto.password, 10);
    return this.userRepository.create({
      ...registerDto,
      password: hash,
    });
  }

  async findByLoginId(loginId: string): Promise<(User & Document) | null> {
    return this.userRepository.findOne({ loginId });
  }

  async findById(id: string): Promise<(User & Document) | null> {
    return this.userRepository.findById(id);
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
