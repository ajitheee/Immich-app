import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person, Face, Asset } from '../../database/entities';
import { PeopleService } from './people.service';
import { PeopleController } from './people.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Person, Face, Asset])],
  controllers: [PeopleController],
  providers: [PeopleService],
  exports: [PeopleService],
})
export class PeopleModule {}