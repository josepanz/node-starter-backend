import { SetMetadata } from '@nestjs/common';

export const APPLICATION_NAME_KEY = 'applicationName';
export const ApplicationName = (name: string) =>
  SetMetadata(APPLICATION_NAME_KEY, name);
