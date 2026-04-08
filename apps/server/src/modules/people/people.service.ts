import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Person, Face, Asset } from '../../database/entities';

export interface PersonStats {
  total: number;
  unnamed: number;
  hidden: number;
}

@Injectable()
export class PeopleService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    @InjectRepository(Face)
    private readonly faceRepository: Repository<Face>,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
  ) {}

  async findAll(userId: string, page = 1, pageSize = 50) {
    const [items, total] = await this.personRepository.findAndCount({
      where: { userId, isHidden: false },
      order: { faceCount: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { items, total, page, pageSize, hasMore: total > page * pageSize };
  }

  async findById(userId: string, id: string): Promise<Person | null> {
    return this.personRepository.findOne({
      where: { id, userId },
    });
  }

  async create(userId: string, name?: string): Promise<Person> {
    const person = this.personRepository.create({
      userId,
      name: name || null,
    });
    return this.personRepository.save(person);
  }

  async update(userId: string, id: string, data: { name?: string; isHidden?: boolean }): Promise<Person> {
    const person = await this.findById(userId, id);
    if (!person) {
      throw new NotFoundException('Person not found');
    }

    if (data.name !== undefined) {
      person.name = data.name;
    }
    if (data.isHidden !== undefined) {
      person.isHidden = data.isHidden;
    }

    return this.personRepository.save(person);
  }

  async delete(userId: string, id: string): Promise<void> {
    const person = await this.findById(userId, id);
    if (!person) {
      throw new NotFoundException('Person not found');
    }

    // Unassign all faces from this person
    await this.faceRepository.update({ personId: id }, { personId: null });

    // Delete the person
    await this.personRepository.delete({ id, userId });
  }

  async merge(userId: string, targetId: string, sourceIds: string[]): Promise<Person> {
    const target = await this.findById(userId, targetId);
    if (!target) {
      throw new NotFoundException('Target person not found');
    }

    // Move all faces from source persons to target
    await this.faceRepository.update(
      { personId: In(sourceIds) },
      { personId: targetId },
    );

    // Update face count on target
    const faceCount = await this.faceRepository.count({ where: { personId: targetId } });
    target.faceCount = faceCount;
    await this.personRepository.save(target);

    // Delete source persons
    await this.personRepository.delete({ id: In(sourceIds), userId });

    return target;
  }

  async getAssets(userId: string, personId: string, page = 1, pageSize = 50) {
    const person = await this.findById(userId, personId);
    if (!person) {
      throw new NotFoundException('Person not found');
    }

    const faces = await this.faceRepository.find({
      where: { personId },
      relations: ['asset', 'asset.metadata'],
    });

    const assets = faces.map((f) => f.asset).filter((a) => !a.isTrashed);
    const total = assets.length;

    return {
      items: assets.slice((page - 1) * pageSize, page * pageSize),
      total,
      page,
      pageSize,
      hasMore: total > page * pageSize,
    };
  }

  async getStats(userId: string): Promise<PersonStats> {
    const [total, unnamed, hidden] = await Promise.all([
      this.personRepository.count({ where: { userId } }),
      this.personRepository.count({ where: { userId, name: null } }),
      this.personRepository.count({ where: { userId, isHidden: true } }),
    ]);

    return { total, unnamed, hidden };
  }

  async assignFace(userId: string, faceId: string, personId: string | null): Promise<void> {
    const face = await this.faceRepository.findOne({
      where: { id: faceId },
      relations: ['asset'],
    });

    if (!face) {
      throw new NotFoundException('Face not found');
    }

    // Verify asset belongs to user
    if (face.asset.userId !== userId) {
      throw new NotFoundException('Face not found');
    }

    face.personId = personId;
    await this.faceRepository.save(face);

    // Update person face counts
    if (personId) {
      const count = await this.faceRepository.count({ where: { personId } });
      await this.personRepository.update({ id: personId }, { faceCount: count });
    }
  }

  async suggestName(userId: string, personId: string): Promise<string[]> {
    // In a real implementation, this would use ML to suggest names based on
    // photos where this person appears with other identified people
    // For now, return empty array
    return [];
  }
}