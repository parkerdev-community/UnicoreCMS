import { Transform } from "class-transformer";

export class RoleDTO {
  server_id: string;

  online: boolean;

  @Transform(({ value }) => value.players.length)
  players: number;

  maxplayers: number;
}
