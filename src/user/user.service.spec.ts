import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

describe('UserService', () => {
  let service: UserService;
  const repo = {
    findOne: jest.fn(),
    create: jest.fn((u) => u),
    save: jest.fn(async (u) => ({ id: 'u1', ...u })),
  };
  const dto = {
    name: 'BANQUE DE SANG',
    firstname: 'Major',
    job: 'Major',
    registration_number_professional_order: 'BDS-1',
    professional_order: 'ONIM',
    email: 'major@test.chu.mg',
    phone: '0340000000',
    password: 'BanqueSang-2026',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    repo.findOne.mockResolvedValue(null);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: repo },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
  });

  it('chiffre un mot de passe reçu en clair (appel direct à POST /users)', async () => {
    const cree: any = await service.create(dto);
    expect(cree.password).not.toBe(dto.password);
    expect(await bcrypt.compare(dto.password, cree.password)).toBe(true);
  });

  it('garde tel quel un mot de passe déjà chiffré (auth-service /auth/register)', async () => {
    const hash = await bcrypt.hash(dto.password, 10);
    const cree: any = await service.create({ ...dto, password: hash });
    expect(cree.password).toBe(hash);
  });

  it('sans matricule, ne cherche pas de doublon sur un matricule vide', async () => {
    await service.create(dto);
    const where = repo.findOne.mock.calls[0][0].where;
    expect(where).toEqual([
      { email: dto.email },
      { registration_number_professional_order: dto.registration_number_professional_order },
    ]);
  });

  it("refuse un numéro d'inscription à l'ordre déjà utilisé", async () => {
    repo.findOne.mockResolvedValue({ email: 'autre@x.mg', matricule: null, registration_number_professional_order: 'BDS-1' });
    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
  });
});
