import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VariantsService } from './variants.service';
import { Variant } from '../products/entities/variant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Variant])],
  providers: [VariantsService],
  exports: [VariantsService],
  // ↑ exported so ProductsModule can use it
})
export class VariantsModule {}
