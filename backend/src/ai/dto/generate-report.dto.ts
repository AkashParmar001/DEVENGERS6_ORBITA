import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateReportDto {
  @ApiProperty({ description: 'Mission ID to generate report for' })
  @IsString()
  @IsNotEmpty()
  mission_id: string;
}
