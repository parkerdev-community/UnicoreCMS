import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server } from './entities/server.entity';

@Injectable()
export class ServersService {
  constructor(
    @InjectRepository(Server)
    private serversRepository: Repository<Server>,
  ) {}

  findAll(relations?: string[]): Promise<Server[]> {
    return this.serversRepository.find({ relations })
  }

  find(id: string, relations?: string[]): Promise<Server> {
    return this.serversRepository.findOne(id, { relations })
  }
}
