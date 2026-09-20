import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  INCIDENT = 'incident',
  STATUS = 'status',
  ANALYSIS = 'analysis',
}

export class CreateReportDto {
  @ApiProperty({ example: 'SAT-102 Inspection Report' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ enum: ReportType })
  @IsOptional()
  @IsEnum(ReportType)
  report_type?: ReportType;

  @ApiPropertyOptional({ type: Object, description: 'Report content' })
  @IsOptional()
  content?: Record<string, any>;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'User who generated the report',
  })
  @IsOptional()
  @IsString()
  generated_by?: string;
}
