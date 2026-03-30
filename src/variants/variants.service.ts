import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Variant } from '../products/entities/variant.entity';
import { CreateVariantDto } from '../products/dto/create-variant.dto';
import { UpdateStockDto } from '../products/dto/update-stock.dto';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class VariantsService {
  constructor(
    @InjectRepository(Variant)
    private readonly variantRepo: Repository<Variant>,
  ) {}

  // ─── combination_key logic ──────────────────────────────────────

  buildCombinationKey(dto: Partial<CreateVariantDto>): string {
    const parts = [dto.color, dto.size, dto.material]
      .filter((v): v is string => !!v && v.trim() !== '')
      .map((v) => v.toLowerCase().trim().replace(/\s+/g, '-'));

    return parts.length > 0 ? parts.join('-') : 'default';
  }

  checkNoDuplicatesInRequest(variants: CreateVariantDto[]): void {
    const keys = variants.map((v) => this.buildCombinationKey(v));
    const seen = new Set<string>();

    for (const key of keys) {
      if (seen.has(key)) {
        throw new ConflictException(
          `Duplicate variant combination "${key}" found in request`,
        );
      }
      seen.add(key);
    }
  }

  // ─── Create many variants ───────────────────────────────────────

  async createMany(
    dtos: CreateVariantDto[],
    product: Product,
  ): Promise<Variant[]> {
    const variants = dtos.map((dto) =>
      this.variantRepo.create({
        color: dto.color ?? null,
        size: dto.size ?? null,
        material: dto.material ?? null,
        combinationKey: this.buildCombinationKey(dto),
        stock: dto.stock,
        priceOverride: dto.priceOverride ?? null,
        product,
      }),
    );

    try {
      return await this.variantRepo.save(variants);
    } catch (err: any) {
      if (err?.code === '23505') {
        throw new ConflictException(
          'A variant combination already exists for this product',
        );
      }
      throw err;
    }
  }

  // ─── Add one variant ────────────────────────────────────────────

  async addOne(dto: CreateVariantDto, product: Product): Promise<Variant> {
    const combinationKey = this.buildCombinationKey(dto);

    const exists = await this.variantRepo.findOne({
      where: { productId: product.id, combinationKey },
    });

    if (exists) {
      throw new ConflictException(
        `Variant combination "${combinationKey}" already exists`,
      );
    }

    const variant = this.variantRepo.create({
      color: dto.color ?? null,
      size: dto.size ?? null,
      material: dto.material ?? null,
      combinationKey,
      stock: dto.stock,
      priceOverride: dto.priceOverride ?? null,
      product,
    });

    return this.variantRepo.save(variant);
  }

  // ─── Update stock ────────────────────────────────────────────────

  async updateStock(
    variantId: string,
    dto: UpdateStockDto,
  ): Promise<Variant> {
    const variant = await this.variantRepo.findOne({
      where: { id: variantId },
    });

    if (!variant) {
      throw new NotFoundException(`Variant "${variantId}" not found`);
    }

    variant.stock = dto.stock;
    return this.variantRepo.save(variant);
  }

  // ─── Delete one variant ──────────────────────────────────────────

  async removeOne(variantId: string): Promise<{ message: string }> {
    const variant = await this.variantRepo.findOne({
      where: { id: variantId },
    });

    if (!variant) {
      throw new NotFoundException(`Variant "${variantId}" not found`);
    }

    await this.variantRepo.remove(variant);
    return { message: `Variant "${variant.combinationKey}" deleted` };
  }
}
