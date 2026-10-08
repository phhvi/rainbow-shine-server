import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { UpdateMemoryDto } from './dto/update-memory.dto';
import { Memory } from './entities/memory.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MemoriesService {
  // EXPLANATION: Constructor Dependency Injection
  // - TypeORM gives us a "Repository" which is like a manager for our Memory table
  // - Repository provides methods like: save(), find(), findOne(), remove(), etc.
  // - @InjectRepository(Memory) tells NestJS to inject the Memory repository here
  // - This is better than writing raw SQL queries - TypeORM handles it for us
  constructor(
    @InjectRepository(Memory)
    private readonly memoryRepository: Repository<Memory>,
  ) {}

  // EXPLANATION: Create a new memory in the user's current space
  // - Now requires authentication - user must be in a space to create memories
  // - Each memory is associated with both a space and the user who created it
  async create(
    createMemoryDto: CreateMemoryDto,
    userId: string,
  ): Promise<Memory> {
    // TODO: In a real implementation, we would fetch the user's current space ID
    // For now, we'll require spaceId in the DTO
    if (!createMemoryDto.spaceId) {
      throw new UnauthorizedException(
        'You must be in a space to create memories',
      );
    }

    const memory = this.memoryRepository.create({
      ...createMemoryDto,
      createdByUserId: userId,
    });

    return await this.memoryRepository.save(memory);
  }

  // EXPLANATION: Get all memories for the user's current space
  // - Now returns memories only from the user's current space
  // - This implements the privacy of shared spaces
  async findAll(spaceId: string): Promise<Memory[]> {
    if (!spaceId) {
      throw new UnauthorizedException(
        'You must be in a space to view memories',
      );
    }

    return await this.memoryRepository.find({
      where: { spaceId },
      order: {
        createdAt: 'DESC', // Sort by newest first
      },
      relations: ['createdByUser'], // Include user who created the memory
    });
  }

  // EXPLANATION: Get one memory by ID (only if it belongs to user's space)
  // - Added security: Users can only access memories in their own space
  async findOne(id: number, spaceId: string): Promise<Memory> {
    const memory = await this.memoryRepository.findOne({
      where: { id, spaceId },
      relations: ['createdByUser'],
    });

    if (!memory) {
      throw new NotFoundException(`Memory with ID ${id} not found`);
    }

    return memory;
  }

  // EXPLANATION: Update a memory (only if it belongs to user's space)
  // - Added security: Users can only update memories in their own space
  async update(
    id: number,
    updateMemoryDto: UpdateMemoryDto,
    spaceId: string,
    userId: string,
  ): Promise<Memory> {
    const memory = await this.findOne(id, spaceId);

    // Optional: Only allow the creator to update their own memories
    // if (memory.createdByUserId !== userId) {
    //   throw new UnauthorizedException(
    //     'You can only update your own memories',
    //   );
    // }

    Object.assign(memory, updateMemoryDto);
    return await this.memoryRepository.save(memory);
  }

  // EXPLANATION: Delete a memory (only if it belongs to user's space)
  // - Added security: Users can only delete memories in their own space
  async remove(id: number, spaceId: string, userId: string): Promise<void> {
    const memory = await this.findOne(id, spaceId);

    // Optional: Only allow the creator to delete their own memories
    // if (memory.createdByUserId !== userId) {
    //   throw new UnauthorizedException(
    //     'You can only delete your own memories',
    //   );
    // }

    await this.memoryRepository.remove(memory);
  }
}
