import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { UpdateMemoryDto } from './dto/update-memory.dto';
import { Memory } from './entities/memory.entity';

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

  // EXPLANATION: Create a new memory
  // - Before: We manually created an object and pushed it to an array
  // - Now: We use repository.create() to prepare the memory object
  //   Then repository.save() to actually save it to the database
  // - The database automatically generates the ID and timestamps
  // - async/await is used because database operations take time
  async create(createMemoryDto: CreateMemoryDto): Promise<Memory> {
    const memory = this.memoryRepository.create(createMemoryDto);
    return await this.memoryRepository.save(memory);
  }

  // EXPLANATION: Get all memories
  // - Before: We returned the in-memory array
  // - Now: We use repository.find() to query the database
  // - We can add options like "order" to sort by newest first
  // - The database does the sorting for us efficiently
  async findAll(): Promise<Memory[]> {
    return await this.memoryRepository.find({
      order: {
        createdAt: 'DESC', // Sort by newest first
      },
    });
  }

  // EXPLANATION: Get one memory by ID
  // - Before: We used array.find() to search the array
  // - Now: We use repository.findOne() with a "where" clause
  // - This generates a SQL query like: SELECT * FROM memories WHERE id = ?
  // - If not found, we throw NotFoundException (HTTP 404)
  async findOne(id: number): Promise<Memory> {
    const memory = await this.memoryRepository.findOne({ where: { id } });
    if (!memory) {
      throw new NotFoundException(`Memory with ID ${id} not found`);
    }
    return memory;
  }

  // EXPLANATION: Update a memory
  // - First, we find the memory (this also checks if it exists)
  // - Object.assign() merges the update data into the existing memory
  // - repository.save() updates the record in the database
  // - TypeORM automatically updates the "updatedAt" timestamp
  async update(id: number, updateMemoryDto: UpdateMemoryDto): Promise<Memory> {
    const memory = await this.findOne(id);
    Object.assign(memory, updateMemoryDto);
    return await this.memoryRepository.save(memory);
  }

  // EXPLANATION: Delete a memory
  // - First, we find the memory (this checks if it exists)
  // - repository.remove() deletes the record from the database
  // - This generates a SQL DELETE query
  async remove(id: number): Promise<void> {
    const memory = await this.findOne(id);
    await this.memoryRepository.remove(memory);
  }
}
