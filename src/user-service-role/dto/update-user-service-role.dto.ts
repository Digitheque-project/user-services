import { PartialType } from '@nestjs/mapped-types';
import { CreateUserServiceRoleDto } from './create-user-service-role.dto';

export class UpdateUserServiceRoleDto extends PartialType(
  CreateUserServiceRoleDto,
) {}
