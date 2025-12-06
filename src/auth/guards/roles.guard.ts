import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ROLES[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    
    // MOCK: In a real app, you'd get the user from the request,
    // which would have been populated by an auth middleware (e.g., JWT).
    // const { user } = context.switchToHttp().getRequest();
    const mockUser = this.getMockUser(context);


    const hasRole = () => requiredRoles.some((role) => mockUser.role?.includes(role));

    if (!mockUser || !mockUser.role || !hasRole()) {
        throw new ForbiddenException("You don't have permission to access this resource.");
    }

    return true;
  }

  // This is a helper to simulate a user object on the request
  private getMockUser(context: ExecutionContext): { id: string; role: ROLES; company_id?: string; } {
      const request = context.switchToHttp().getRequest();
      const headers = request.headers;

      // Simulate user based on a header like 'x-user-role'
      // In a real app, this would be a decoded JWT payload
      const role = headers['x-user-role'] as ROLES;
      const userId = headers['x-user-id'] as string;
      const companyId = headers['x-company-id'] as string;

      if(role) {
          return { id: userId, role, company_id: companyId };
      }
      
      // Default to a guest user if no role is provided
      return { id: 'guest', role: ROLES.EMPLOYEE };
  }
}
