import { UnprocessableEntityException, Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';
import { User } from 'src/admin/users/entities/user.entity';
import { UsersService } from 'src/admin/users/users.service';
import { MoreThanOrEqual, Not, Repository } from 'typeorm';
import { envConfig } from 'unicore-common';
import { RefreshToken } from './entities/refresh-token.entity';
import { JWTMinecraftPayload, JWTPayload, JWTRefreshPayload } from './interfaces/jwt-payload';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedDto } from './dto/authenticated.dto';
import { InjectRepository } from '@nestjs/typeorm';
import * as ms from 'ms';
import { MomentWrapper } from '@common';

@Injectable()
export class TokensService {
  constructor(
    @Inject('moment')
    private moment: MomentWrapper,
    @InjectRepository(RefreshToken)
    private tokensRepository: Repository<RefreshToken>,
    private usersService: UsersService,
    private jwt: JwtService,
  ) { }

  async generateAccessToken(user: User): Promise<string> {
    const payload: JWTPayload = {
      sub: user.uuid,
    };

    return this.jwt.sign(payload, {
      expiresIn: envConfig.jwtExpires,
    });
  }

  async generateMinecraftAccessToken(user: User, refreshPayload: JWTRefreshPayload): Promise<string> {
    const payload: JWTMinecraftPayload = {
      sub: user.uuid,
      ref: refreshPayload.jwtid,
    };

    return this.jwt.sign(payload, {
      expiresIn: envConfig.jwtRefreshExpires,
    });
  }

  async generateRefreshToken(user: User, agent?: string, ip?: string): Promise<string> {
    const expires = this.moment().utc().add(ms(envConfig.jwtRefreshExpires), 'milliseconds').toDate();
    const token = await this.tokensRepository.save({
      agent,
      ip,
      user,
      expires,
    });

    const payload: JWTRefreshPayload = {
      sub: user.uuid,
      jwtid: token.uuid,
    };

    return this.jwt.signAsync(payload, {
      expiresIn: envConfig.jwtRefreshExpires,
    });
  }

  async updateRefreshToken(user: User, refreshToken: RefreshToken, ip?: string): Promise<string> {
    refreshToken.ip = ip;
    refreshToken.uuid = uuidv4();

    await this.tokensRepository.save(refreshToken);

    const payload: JWTRefreshPayload = {
      sub: user.uuid,
      jwtid: refreshToken.uuid,
    };

    return this.jwt.signAsync(payload, {
      expiresIn: envConfig.jwtRefreshExpires,
    });
  }

  async decodeToken(token: string): Promise<JWTRefreshPayload | JWTPayload> {
    try {
      return this.jwt.verifyAsync(token);
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnprocessableEntityException('Token expired');
      } else {
        throw new UnprocessableEntityException('Token malformed');
      }
    }
  }

  async resolveRefreshToken(encoded: string): Promise<{ user: User; token: RefreshToken }> {
    const payload = (await this.decodeToken(encoded)) as JWTRefreshPayload;
    const token = await this.tokensRepository.findOne({
      uuid: payload.jwtid,
      expires: MoreThanOrEqual(this.moment().utc().toDate()),
    });

    if (!token) {
      throw new UnprocessableEntityException('Refresh token not found');
    }

    const user = await this.usersService.getById(payload.sub, ['skin', 'cloak', 'roles']);

    if (!user) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    return { user, token };
  }

  async createTokensFromRefreshToken(
    refresh: string,
    agent?: string,
    ip?: string,
  ): Promise<Omit<AuthenticatedDto, 'user' | 'refreshToken'>> {
    const { token, user } = await this.resolveRefreshToken(refresh);

    token.updated = this.moment().utc().toDate()
    await this.tokensRepository.save(token);

    //const refreshToken = await this.updateRefreshToken(user, token, ip);
    const accessToken = await this.generateAccessToken(user);

    return { /* refreshToken, */ accessToken };
  }

  async revokeRefreshToken(encoded: string): Promise<void> {
    const payload = (await this.decodeToken(encoded)) as JWTRefreshPayload;
    const token = await this.tokensRepository.findOne({
      uuid: payload.jwtid,
    });

    if (token && payload) {
      await this.tokensRepository.remove(token);
    }
  }

  async revokeRefreshTokenBySession(uuid: string): Promise<void> {
    const token = await this.tokensRepository.findOne({ uuid });

    if (token) {
      await this.tokensRepository.remove(token);
    }
  }

  async revokeRefreshTokensByUser(user: User): Promise<void> {
    const token = await this.tokensRepository.find({ user });

    if (token) {
      await this.tokensRepository.remove(token);
    }
  }

  async revokeRefreshTokensByUserOther(user: User, token: string): Promise<void> {
    var payload: JWTRefreshPayload = null;

    if (token) {
      try {
        payload = await this.decodeToken(token) as JWTRefreshPayload
      } catch { }
    }

    const tok = await this.tokensRepository.find({ user, uuid: Not(payload?.jwtid) });

    if (token) {
      await this.tokensRepository.remove(tok);
    }
  }

  async revokeRefreshTokenBySessionAndUser(user: User, id: number): Promise<void> {
    const token = await this.tokensRepository.findOne({ user, id });

    if (token) {
      await this.tokensRepository.remove(token);
    }
  }

  async sessions(user: User, token: string) {
    var curnet = null;

    if (token) {
      try {
        const payload = await this.decodeToken(token) as JWTRefreshPayload
        curnet = await this.tokensRepository.findOne({ uuid: payload.jwtid })
      } catch { }
    }

    return { curnet, all: await this.tokensRepository.find({
      where: { user },
      order: { updated: "DESC" }
    }) }
  }
}
