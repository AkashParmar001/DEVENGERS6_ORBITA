import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class AnalyzeAnomalyDto {
  @ApiProperty({ description: 'Space object ID' })
  @IsString()
  @IsNotEmpty()
  object_id: string;

  @ApiProperty({ description: 'Space object name' })
  @IsString()
  @IsNotEmpty()
  object_name: string;

  @ApiProperty({ description: 'Current telemetry data' })
  @IsObject()
  telemetry: Record<string, unknown>;

  @ApiProperty({
    description: 'Detected anomaly details',
    properties: {
      type: { type: 'string', description: 'Anomaly type' },
      severity: { type: 'string', description: 'Anomaly severity' },
      detected_at: { type: 'string', description: 'ISO timestamp' },
      description: { type: 'string', description: 'Anomaly description' },
      affected_systems: {
        type: 'array',
        items: { type: 'string' },
        description: 'Affected subsystems',
      },
    },
  })
  @IsObject()
  anomaly: {
    type: string;
    severity: string;
    detected_at: string;
    description: string;
    affected_systems: string[];
  };
}
