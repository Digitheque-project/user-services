import {
  BadRequestException, Body, Controller, Delete, ForbiddenException, Get, NotFoundException,
  Param, Patch, Put, Req, Res, UnauthorizedException, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { MonMotDePasseDto } from './dto/mon-mot-de-passe.dto';
import type { JetonAgent } from './jeton-agent';

/** Photo de profil : 2 Mo au plus (les fronts la réduisent avant l'envoi). */
const MAX_PHOTO_OCTETS = 2 * 1024 * 1024;
const TYPES_PHOTO = ['image/jpeg', 'image/png', 'image/webp'];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Requete = { user?: JetonAgent };

function moi(req: Requete): string {
  const id = req.user?.userId;
  // Un jeton de service (ou la clé interne) n'est pas une personne.
  if (!id || !UUID.test(id)) throw new UnauthorizedException('Réservé à l’agent connecté');
  return id;
}

/**
 * « Mon compte », pour tous les services : l'agent change SON mot de passe
 * (en donnant l'actuel) et gère SA photo de profil, visible dans la
 * messagerie et les en-têtes des fronts.
 */
@ApiBearerAuth('access-token')
@ApiTags('Mon compte')
@Controller('users')
export class MonCompteController {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  @Patch('moi/mot-de-passe')
  @ApiOperation({ summary: 'Modifier mon mot de passe (mot de passe actuel exigé)' })
  async monMotDePasse(@Req() req: Requete, @Body() dto: MonMotDePasseDto) {
    const id = moi(req);
    const user = await this.users.findOne({ where: { id }, select: { id: true, password: true } });
    if (!user) throw new NotFoundException('Compte introuvable');
    if (!(await bcrypt.compare(dto.ancien, user.password))) {
      throw new ForbiddenException('Mot de passe actuel incorrect');
    }
    if (dto.ancien === dto.nouveau) throw new BadRequestException('Le nouveau mot de passe doit être différent');
    await this.users.update(id, { password: await bcrypt.hash(dto.nouveau, await bcrypt.genSalt()) });
    return { message: 'Mot de passe modifié' };
  }

  @Put('moi/photo')
  @ApiOperation({ summary: 'Définir ma photo de profil (JPEG, PNG ou WebP, 2 Mo maximum)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { photo: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('photo', { storage: memoryStorage(), limits: { fileSize: MAX_PHOTO_OCTETS } }))
  async maPhoto(@Req() req: Requete, @UploadedFile() photo?: Express.Multer.File) {
    const id = moi(req);
    if (!photo) throw new BadRequestException('Aucune photo envoyée (champ « photo »)');
    if (!TYPES_PHOTO.includes(photo.mimetype)) {
      throw new BadRequestException('Format accepté : JPEG, PNG ou WebP');
    }
    const photoMaj = new Date();
    await this.users.update(id, { photo: photo.buffer, photoType: photo.mimetype, photoMaj });
    return { photoMaj };
  }

  @Delete('moi/photo')
  @ApiOperation({ summary: 'Retirer ma photo de profil' })
  async retirerPhoto(@Req() req: Requete) {
    await this.users.update(moi(req), { photo: null, photoType: null, photoMaj: null });
    return { photoMaj: null };
  }

  @Get(':id/photo')
  @ApiOperation({ summary: 'Photo de profil d’un utilisateur (« moi » pour la mienne)' })
  async photo(@Req() req: Requete, @Param('id') id: string, @Res() res: Response) {
    const cible = id === 'moi' ? moi(req) : id;
    if (!UUID.test(cible)) throw new NotFoundException('Photo introuvable');
    const user = await this.users
      .createQueryBuilder('u')
      .select(['u.id', 'u.photoMaj'])
      .addSelect(['u.photo', 'u.photoType'])
      .where('u.id = :cible', { cible })
      .getOne();
    if (!user?.photo) throw new NotFoundException('Pas de photo');
    res.setHeader('Content-Type', user.photoType ?? 'image/jpeg');
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.send(user.photo);
  }
}
