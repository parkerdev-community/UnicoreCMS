import { Type } from 'class-transformer';
import { IsArray, IsDefined, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { GroupFeature } from '../entities/group-feature.entity';

export class GroupInput {
  @IsDefined()
  @IsString()
  name: string;

  @IsDefined()
  @IsString()
  ingame_id: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDefined()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99)
  sale: number;

  @IsDefined()
  @IsArray()
  @Type(() => GroupFeature)
  features: GroupFeature[];

  @IsDefined()
  @IsArray()
  @IsString({ each: true })
  servers: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  web_perms: string[];

  @IsDefined()
  @IsArray()
  @IsInt({ each: true })
  kits: number[];

  @IsDefined()
  @IsArray()
  @IsInt({ each: true })
  periods: number[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  virtual_percent?: number
}
