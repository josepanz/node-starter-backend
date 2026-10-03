import { IsEnum, IsLatitude, IsLongitude, ValidateIf } from 'class-validator';

export enum PresenceStatus {
  ONLINE = 'online',
  AWAY = 'away',
  BUSY = 'busy',
}

const hasCoordinates = (o: PresenceUpdateDTO): boolean =>
  o.latitude !== undefined || o.longitude !== undefined;

/** Payload del canal demo `presence:update`. Lat/lng son opcionales pero van juntas. */
export class PresenceUpdateDTO {
  @IsEnum(PresenceStatus)
  status!: PresenceStatus;

  @ValidateIf(hasCoordinates)
  @IsLatitude()
  latitude?: number;

  @ValidateIf(hasCoordinates)
  @IsLongitude()
  longitude?: number;
}

export interface PresenceSnapshot {
  userId: number;
  status: PresenceStatus;
  latitude?: number;
  longitude?: number;
  at: string;
}
