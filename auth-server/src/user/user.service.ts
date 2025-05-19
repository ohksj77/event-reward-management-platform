import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.schema';
import * as bcrypt from 'bcrypt';
import { UserMapper } from './user.mapper';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const userData = UserMapper.toEntity({
      ...createUserDto,
      password: hashedPassword
    });
    return this.userRepository.create(userData);
  }

  async findByLoginId(loginId: string): Promise<User | null> {
    return this.userRepository.findOne({ loginId });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
