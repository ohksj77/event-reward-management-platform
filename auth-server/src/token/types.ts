import { UserRole } from '../user/user.schema';

export interface JwtPayload {
    sub: string;
    username: string;
    role: UserRole;
    iat: number;
}
