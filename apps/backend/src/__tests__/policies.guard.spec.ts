import { PoliciesGuard } from '../services/auth/permissions/permissions.guard';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from '../services/auth/permissions/permissions.service';
import { SubscriptionException } from '../services/auth/permissions/subscription.exception';
import { ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

describe('PoliciesGuard', () => {
  let guard: PoliciesGuard;
  let reflector: jest.Mocked<Reflector>;
  let permissionsService: jest.Mocked<PermissionsService>;
  let mockContext: Partial<jest.Mocked<ExecutionContext>>;

  beforeEach(() => {
    // Mock do Reflector
    reflector = {
      get: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    // Mock do PermissionsService
    permissionsService = {
      check: jest.fn(),
    } as unknown as jest.Mocked<PermissionsService>;

    // Instância do PoliciesGuard
    guard = new PoliciesGuard(reflector, permissionsService);

    // Mock do ExecutionContext e switchToHttp
    mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn(),
      }),
    } as unknown as jest.Mocked<ExecutionContext>;
  });

  // Função para mockar Request
  const mockRequest = (data: Partial<Request>): Request => ({
    ...data,
    headers: {},
    cookies: {},
    get: jest.fn(),
    header: jest.fn(),
    accepts: jest.fn(),
    acceptsCharsets: jest.fn(),
  } as Request);

  test('Should return true for unprotected routes (/auth, /stripe)', async () => {
    const req = mockRequest({ path: '/auth/login' });
    (mockContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(req);

    const result = await guard.canActivate(mockContext as ExecutionContext);
    expect(result).toBe(true);
  });

  test('Should return true if no policies are defined', async () => {
    const req = mockRequest({ path: '/protected' });
    (mockContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(req);
    reflector.get.mockReturnValueOnce(undefined); // Sem políticas definidas

    const result = await guard.canActivate(mockContext as ExecutionContext);
    expect(result).toBe(true);
  });

  test('Should throw SubscriptionException if a policy is not met', async () => {
  const req = mockRequest({
    path: '/protected',
    org: {
      id: 'org-123',
      createdAt: new Date(),
      users: [{ role: 'ADMIN' }],
    },
  });

  (mockContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(req);

  const mockPolicies = [['READ', 'SECTION1']];
  reflector.get.mockReturnValueOnce(mockPolicies);

  const mockAbility = {
    can: jest.fn((action: string, section: string) => action !== 'READ'), // Simula falha de política
    relevantRuleFor: jest.fn(),
    cannot: jest.fn(),
    _hasPerFieldRules: false,
    _indexedRules: {},
  };

  permissionsService.check.mockResolvedValueOnce(mockAbility as any);

  await expect(guard.canActivate(mockContext as ExecutionContext)).rejects.toThrow(
    SubscriptionException
  );
});

  
  test('Should return true if all policies are met', async () => {
    const req = mockRequest({
      path: '/protected',
      org: {
        id: 'org-123',
        createdAt: new Date(),
        users: [{ role: 'ADMIN' }],
      },
    });
    (mockContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(req);

    const mockPolicies = [['READ', 'SECTION1']];
    reflector.get.mockReturnValueOnce(mockPolicies);

    permissionsService.check.mockResolvedValueOnce({
      can: jest.fn(() => true), // Todas as políticas são satisfeitas
    });

    const result = await guard.canActivate(mockContext as ExecutionContext);
    expect(result).toBe(true);
  });
});
