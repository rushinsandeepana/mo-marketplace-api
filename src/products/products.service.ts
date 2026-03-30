import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { VariantsService } from '../variants/variants.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    private readonly variantsService: VariantsService,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    this.variantsService.checkNoDuplicatesInRequest(dto.variants);

    const product = this.productRepo.create({
      name: dto.name,
      description: dto.description ?? null,
      basePrice: dto.basePrice,
    });

    const saved = await this.productRepo.save(product);

    await this.variantsService.createMany(dto.variants, saved);

    return this.findOne(saved.id);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product "${id}" not found`);
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (dto.name !== undefined) product.name = dto.name;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.basePrice !== undefined) product.basePrice = dto.basePrice;

    await this.productRepo.save(product);
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const product = await this.findOne(id);
    await this.productRepo.remove(product);
    return { message: `Product "${product.name}" deleted successfully` };
  }

  async addVariant(productId: string, dto: CreateVariantDto) {
    const product = await this.findOne(productId);
    return this.variantsService.addOne(dto, product);
  }

  async updateStock(variantId: string, dto: UpdateStockDto) {
    return this.variantsService.updateStock(variantId, dto);
  }

  async removeVariant(variantId: string) {
    return this.variantsService.removeOne(variantId);
  }
}
