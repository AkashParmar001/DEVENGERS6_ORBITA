import { Module } from '@nestjs/common';
import { PhysicsValidationService } from './physics-validation.service';
import { RiskValidationService } from './risk-validation.service';
import { ConstraintValidationService } from './constraint-validation.service';
import { SchemaValidationService } from './schema-validation.service';

@Module({
  providers: [
    PhysicsValidationService,
    RiskValidationService,
    ConstraintValidationService,
    SchemaValidationService,
  ],
  exports: [
    PhysicsValidationService,
    RiskValidationService,
    ConstraintValidationService,
    SchemaValidationService,
  ],
})
export class ValidationModule {}
