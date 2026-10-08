import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMemoryDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsNotEmpty()
  date: string;

  latitude: number | null;
  longitude: number | null;

  // This will be populated from the user's current space
  // Not required in the DTO body for better UX
  spaceId?: string;
}
