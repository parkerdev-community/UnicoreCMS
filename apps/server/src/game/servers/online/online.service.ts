import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Online } from './entities/online.entity';
import * as _ from 'lodash';
import { query, QueryResult } from 'gamedig';
import { Server } from '../entities/server.entity';
import * as moment from 'moment';
import { UpdateOnline } from './interfaces/update-online.interface';
import { Onlines } from './dto/onlines.dto';
import { OnlinesRecord } from './entities/onlines-record.entity';
import { OnlinesAbsoluteRecord } from './entities/onlines-absolute-record.entity';
import { RecordOnlineInterface } from './interfaces/record-online.interface';
import { classToPlain } from 'class-transformer';

@Injectable()
export class OnlineService {
  constructor(
    @InjectRepository(Online)
    private onlineRepository: Repository<Online>,
    @InjectRepository(OnlinesRecord)
    private onlinesRecordsRepository: Repository<OnlinesRecord>,
    @InjectRepository(OnlinesAbsoluteRecord)
    private onlinesAbsoluteRecordsRepository: Repository<OnlinesAbsoluteRecord>,
  ) {}

  async find(): Promise<Onlines> {
    const servers = _.orderBy(await this.onlineRepository.find({
      relations: ['server'],
    }), ["server.priority"], ["asc"]);
    const record = await this.onlinesRecordsRepository.findOne({
      order: { created: 'DESC' },
      where: { created: MoreThanOrEqual(moment().startOf('day').toDate()) },
    });
    const absolute = await this.onlinesAbsoluteRecordsRepository.findOne({
      order: { online: 'DESC' },
    });

    return {
      servers,
      total: {
        online: _(servers)
          .map((serv) => serv.players)
          .sum(),
        records: {
          today: {
            online: record?.online || 0,
            created: moment(record?.updated).utc().toDate(),
          },
          absolute: {
            online: absolute?.online || 0,
            created: moment(absolute?.created).utc().toDate(),
          },
        },
      },
    };
  }

  async updateOnlinesRecords(): Promise<Onlines> {
    const onlines: Onlines = await this.find();
    let today: RecordOnlineInterface;
    let absolute: RecordOnlineInterface;

    const id = (
      await this.onlinesRecordsRepository.findOne({
        order: { created: 'DESC' },
        where: { created: MoreThanOrEqual(moment().startOf('day').toDate()) },
      })
    )?.id;

    // Update absolute record
    if (onlines.total.online > onlines.total.records.absolute.online) {
      const entity = await this.onlinesAbsoluteRecordsRepository.save({
        online: onlines.total.online,
      });
      absolute = { online: entity.online, created: entity.created };
    }

    // Update today record
    if (onlines.total.online > onlines.total.records.today.online) {
      if (moment(onlines.total.records.today.created).utc().isSame(moment().utc(), 'day') && id) {
        await this.onlinesRecordsRepository
          .createQueryBuilder()
          .createQueryBuilder()
          .update(OnlinesRecord)
          .set({
            online: onlines.total.online,
            updated: moment().utc().toDate(),
          })
          .where('id = :id', { id })
          .execute();

        today = {
          online: onlines.total.online,
          created: moment().utc().toDate(),
        };
      } else {
        const entity = await this.onlinesRecordsRepository.save({
          online: onlines.total.online,
        });

        today = {
          online: entity.online,
          created: entity.created,
        };
      }
    }

    if (absolute) onlines.total.records.absolute = absolute;

    if (today) onlines.total.records.today = today;

    return onlines;
  }

  async updateOnline(server: Server): Promise<UpdateOnline> {
    if (!server.query || !server.query.host || !server.online) {
      return {
        instance: server,
        updated: false,
      };
    }

    let online: Pick<Online, 'maxplayers' | 'online' | 'players'>;
    const onlineState: QueryResult | null = await query({
      type: 'minecraft',
      host: server.query.host,
      port: server.query.port,
    }).catch(() => null);

    if (onlineState) {
      online = {
        maxplayers: onlineState.maxplayers,
        players: onlineState.players.length,
        online: true,
      };
    } else {
      online = {
        maxplayers: 0,
        players: 0,
        online: false,
      };
    }

    if (!_.isEqual(classToPlain(server.online), { ...server.online, ...online })) {
      var record: number = server.online.record;
      var record_today: number = server.online.record_today;

      if (online.players > server.online.record) {
        record = online.players;
      }

      if (online.players > server.online.record_today || !moment().utc().isSame(moment(server.online.updated).utc(), 'd')) {
        record_today = online.players;
      }

      await this.onlineRepository
        .createQueryBuilder()
        .createQueryBuilder()
        .update(Online)
        .set({ ...online, record, record_today })
        .where('server_id = :id', { id: server.id })
        .execute();

      server.online = { ...server.online, ...online };

      return {
        instance: server,
        updated: true,
      };
    }

    return {
      instance: server,
      updated: false,
    };
  }
}
