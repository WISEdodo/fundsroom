import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/database';
import { createError } from '../../middleware/errorHandler';
import {
  CreateProductInput,
  UpdateProductInput,
  StockAdjustmentInput,
} from './products.schema';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || '';
    const category = req.query.category as string;
    const lowStock = req.query.lowStock === 'true';

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = { equals: category, mode: 'insensitive' };
    // Note: lowStock filter applied post-query since Prisma doesn't support column comparisons directly

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    // Add low stock flag
    const productsWithFlag = products.map((p) => ({
      ...p,
      isLowStock: p.currentStock <= p.minStockAlert,
    }));

    const filteredData = lowStock
      ? productsWithFlag.filter((p) => p.isLowStock)
      : productsWithFlag;

    res.json({
      success: true,
      data: filteredData,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id as string },
    });

    if (!product) {
      return next(createError('Product not found', 404));
    }

    res.json({
      success: true,
      data: { ...product, isLowStock: product.currentStock <= product.minStockAlert },
    });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: CreateProductInput = req.body;

    const existing = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existing) {
      return next(createError('A product with this SKU already exists', 409));
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        category: data.category,
        unitPrice: data.unitPrice,
        currentStock: data.currentStock,
        minStockAlert: data.minStockAlert,
        location: data.location || null,
      },
    });

    // Log initial stock as IN movement
    if (data.currentStock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          quantity: data.currentStock,
          movementType: 'IN',
          reason: 'Initial stock',
          createdBy: req.user!.userId,
        },
      });
    }

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: UpdateProductInput = req.body;

    const existing = await prisma.product.findUnique({ where: { id: req.params.id as string } });
    if (!existing) {
      return next(createError('Product not found', 404));
    }

    if (data.sku && data.sku !== existing.sku) {
      const skuConflict = await prisma.product.findUnique({ where: { sku: data.sku } });
      if (skuConflict) {
        return next(createError('A product with this SKU already exists', 409));
      }
    }

    const product = await prisma.product.update({
      where: { id: req.params.id as string },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.sku !== undefined && { sku: data.sku }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.unitPrice !== undefined && { unitPrice: data.unitPrice }),
        ...(data.minStockAlert !== undefined && { minStockAlert: data.minStockAlert }),
        ...(data.location !== undefined && { location: data.location || null }),
      },
    });

    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const getStockMovements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const product = await prisma.product.findUnique({ where: { id: req.params.id as string } });
    if (!product) {
      return next(createError('Product not found', 404));
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where: { productId: req.params.id as string },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, role: true } } },
      }),
      prisma.stockMovement.count({ where: { productId: req.params.id as string } }),
    ]);

    res.json({
      success: true,
      data: movements,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

export const adjustStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { quantity, movementType, reason }: StockAdjustmentInput = req.body;

    const product = await prisma.product.findUnique({ where: { id: req.params.id as string } });
    if (!product) {
      return next(createError('Product not found', 404));
    }

    if (movementType === 'OUT' && product.currentStock < quantity) {
      return next(
        createError(
          `Insufficient stock. Available: ${product.currentStock}, Requested: ${quantity}`,
          409
        )
      );
    }

    const newStock =
      movementType === 'IN'
        ? product.currentStock + quantity
        : product.currentStock - quantity;

    const [updatedProduct, movement] = await prisma.$transaction([
      prisma.product.update({
        where: { id: req.params.id as string },
        data: { currentStock: newStock },
      }),
      prisma.stockMovement.create({
        data: {
          productId: req.params.id as string,
          quantity,
          movementType,
          reason,
          createdBy: req.user!.userId,
        },
      }),
    ]);

    res.json({
      success: true,
      data: { product: updatedProduct, movement },
    });
  } catch (err) {
    next(err);
  }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    res.json({ success: true, data: categories.map((c) => c.category) });
  } catch (err) {
    next(err);
  }
};
