import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Variant } from '../products/entities/variant.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepo: Repository<Order>,

    @InjectRepository(OrderItem)
    private itemsRepo: Repository<OrderItem>,

    @InjectRepository(Variant)
    private variantsRepo: Repository<Variant>,
  ) {}

  async create(dto: CreateOrderDto, userId: string) {
    const variantIds = dto.items.map((i) => i.variantId);

    const variants = await this.variantsRepo.find({
      where: { id: In(variantIds) },
      relations: ['product'],
    });

    if (variants.length !== variantIds.length) {
      throw new BadRequestException('One or more variants not found');
    }

    for (const item of dto.items) {
      const variant = variants.find((v) => v.id === item.variantId)!;
      if (variant.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${variant.combinationKey}". ` +
          `Requested: ${item.quantity}, available: ${variant.stock}`,
        );
      }
    }

    return this.ordersRepo.manager.transaction(async (em) => {
      const order = em.create(Order, { userId, status: 'pending' });
      await em.save(order);

      const updatedStocks: Record<string, number> = {};

      for (const item of dto.items) {
        const variant = variants.find((v) => v.id === item.variantId)!;

        const unitPrice = Number(
          variant.priceOverride ?? variant.product.basePrice,
        );

        await em.save(
          em.create(OrderItem, {
            order,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice,
          }),
        );

        await em.decrement(
          Variant,
          { id: variant.id },
          'stock',
          item.quantity,
        );

        updatedStocks[variant.id] = variant.stock - item.quantity;
      }

      return {
        orderId: order.id,
        status: order.status,
        updatedStocks,
      };
    });
  }
}