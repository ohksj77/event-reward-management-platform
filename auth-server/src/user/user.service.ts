import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserDocument } from './user.schema';
import { RegisterDto } from '../auth/dto/register.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async create(registerDto: RegisterDto): Promise<UserDocument> {
    const hash = await bcrypt.hash(registerDto.password, 10);
    return this.userRepository.create({
      ...registerDto,
      password: hash,
    });
  }

  async findByLoginId(loginId: string): Promise<UserDocument | null> {
    return this.userRepository.findOne({ loginId });
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userRepository.findById(id);
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
