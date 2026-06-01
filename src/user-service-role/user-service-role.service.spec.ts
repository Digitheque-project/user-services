import { Test, TestingModule } from '@nestjs/testing';
import { UserServiceRoleService } from './user-service-role.service';

describe('UserServiceRoleService', () => {
  let service: UserServiceRoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserServiceRoleService],
    }).compile();

    service = module.get<UserServiceRoleService>(UserServiceRoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
