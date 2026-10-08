import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MemoriesService } from './memories.service';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { UpdateMemoryDto } from './dto/update-memory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('memories')
@UseGuards(JwtAuthGuard) // Protect all memory routes with JWT
export class MemoriesController {
  constructor(private readonly memoriesService: MemoriesService) {}

  /**
   * Create a new memory in the user's current space
   * POST /memories
   */
  @Post()
  async create(@Body() createMemoryDto: CreateMemoryDto, @Request() req: any) {
    // Get user's current space ID from JWT payload
    // For now, we'll get it from the request body
    // In a real implementation, we'd fetch it from the user service
    const spaceId = createMemoryDto.spaceId || req.user.currentSpaceId;

    createMemoryDto.spaceId = spaceId;

    const memory = await this.memoriesService.create(
      createMemoryDto,
      req.user.userId,
    );

    return {
      memory,
      message: 'Memory created successfully',
    };
  }

  /**
   * Get all memories from the user's current space
   * GET /memories
   */
  @Get()
  async findAll(@Request() req: any) {
    // Get user's current space ID
    // In a real implementation, this would come from the user service
    const spaceId = req.user.currentSpaceId;

    if (!spaceId) {
      return {
        memories: [],
        message: 'You must be in a space to view memories',
      };
    }

    const memories = await this.memoriesService.findAll(spaceId);

    return {
      memories,
      message: 'Memories retrieved successfully',
    };
  }

  /**
   * Get a specific memory (only if it belongs to user's space)
   * GET /memories/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const spaceId = req.user.currentSpaceId;

    const memory = await this.memoriesService.findOne(+id, spaceId);

    return {
      memory,
      message: 'Memory retrieved successfully',
    };
  }

  /**
   * Update a memory (only if it belongs to user's space)
   * PATCH /memories/:id
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateMemoryDto: UpdateMemoryDto,
    @Request() req: any,
  ) {
    const memory = await this.memoriesService.update(
      +id,
      updateMemoryDto,
      req.user.currentSpaceId,
      req.user.userId,
    );

    return {
      memory,
      message: 'Memory updated successfully',
    };
  }

  /**
   * Delete a memory (only if it belongs to user's space)
   * DELETE /memories/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.memoriesService.remove(
      +id,
      req.user.currentSpaceId,
      req.user.userId,
    );

    return {
      message: 'Memory deleted successfully',
    };
  }
}
