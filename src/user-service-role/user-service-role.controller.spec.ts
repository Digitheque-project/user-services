import { Test, TestingModule } from '@nestjs/testing';
import { UserServiceRoleController } from './user-service-role.controller';
import { UserServiceRoleService } from './user-service-role.service';

describe('UserServiceRoleController', () => {
  let controller: UserServiceRoleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserServiceRoleController],
      providers: [UserServiceRoleService],
    }).compile();

    controller = module.get<UserServiceRoleController>(
      UserServiceRoleController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
