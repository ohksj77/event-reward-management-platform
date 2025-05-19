import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/auth.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AdminRegisterDto } from './dto/admin-register.dto';
import { AuthMapper } from './auth.mapper';
import { UserResponseDto } from './dto/user-response.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '사용자 회원가입', description: '새로운 사용자를 등록합니다.' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: '회원가입 성공',
    type: UserResponseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: '잘못된 요청 데이터' 
  })
  async register(@Body() registerDto: RegisterDto): Promise<UserResponseDto> {
    return this.authService.register(registerDto);
  }

  /** 테스트 편의성을 위한 어드민 API */
  @Post('admin/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '관리자 회원가입', description: '새로운 관리자를 등록합니다. (테스트용)' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: '관리자 회원가입 성공',
    type: UserResponseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: '잘못된 요청 데이터' 
  })
  async adminRegister(@Body() adminRegisterDto: AdminRegisterDto): Promise<UserResponseDto> {
    return this.authService.adminRegister(adminRegisterDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그인', description: '아이디와 비밀번호로 로그인합니다.' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '로그인 성공',
    type: TokenResponseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: '인증 실패' 
  })
  async login(@Body() loginDto: LoginDto): Promise<TokenResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '토큰 갱신', description: '리프레시 토큰으로 새로운 액세스 토큰을 발급받습니다.' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '토큰 갱신 성공',
    type: TokenResponseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: '유효하지 않은 리프레시 토큰' 
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그아웃', description: '리프레시 토큰을 무효화합니다.' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '로그아웃 성공' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: '유효하지 않은 리프레시 토큰' 
  })
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.logout(refreshTokenDto);
  }
}
