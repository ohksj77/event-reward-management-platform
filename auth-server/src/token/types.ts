import { UserRole } from '../user/user.schema';

export interface JwtPayload {
    sub: string;
    loginId: string;
    role: UserRole;
    iat: number;
}
