import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/database';
import { createError } from '../../middleware/errorHandler';
import { CreateChallanInput, UpdateChallanInput } from './challans.schema';

// Generate unique challan number: CH-YYYY-NNNN
const generateChallanNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const prefix = `CH-${year}-`;
  const lastChallan = await prisma.challan.findFirst({
    where: { challanNumber: { startsWith: prefix } },
    orderBy: { challanNumber: 'desc' },
  });

  let sequence = 1;
  if (lastChallan) {
    const lastSeq = parseInt(lastChallan.challanNumber.split('-')[2]);
    sequence = lastSeq + 1;
  }

  return `${prefix}${String(sequence).padStart(4, '0')}`;
};

export const getChallans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || '';
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { challanNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (status) where.status = status;

    const [challans, total] = await Promise.all([
      prisma.challan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, mobile: true } },
          createdByUser: { select: { id: true, name: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.challan.count({ where }),
    ]);

    res.json({
      success: true,
      data: challans,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

export const getChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const challan = await prisma.challan.findUnique({
      where: { id: req.params.id as string },
      include: {
        customer: true,
        createdByUser: { select: { id: true, name: true, role: true } },
        items: {
          include: { product: { select: { id: true, name: true, sku: true } } },
        },
      },
    });

    if (!challan) {
      return next(createError('Challan not found', 404));
    }

    res.json({ success: true, data: challan });
  } catch (err) {
    next(err);
  }
};

export const createChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: CreateChallanInput = req.body;

    // Validate customer
    const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
    if (!customer) {
      return next(createError('Customer not found', 404));
    }

    // Validate all products exist
    const productIds = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      return next(createError('One or more products not found', 404));
    }

    // If confirming immediately, check stock
    if (data.status === 'confirmed') {
      const stockErrors: string[] = [];
      for (const item of data.items) {
        const product = products.find((p) => p.id === item.productId)!;
        if (product.currentStock < item.quantity) {
          stockErrors.push(
            `Insufficient stock for "${product.name}" (SKU: ${product.sku}). Available: ${product.currentStock}, Requested: ${item.quantity}`
          );
        }
      }
      if (stockErrors.length > 0) {
        return next(createError('Stock check failed', 409, stockErrors));
      }
    }

    const challanNumber = await generateChallanNumber();
    const totalQuantity = data.items.reduce((sum, i) => sum + i.quantity, 0);

    // Build customer snapshot
    const customerSnapshot = {
      id: customer.id,
      name: customer.name,
      mobile: customer.mobile,
      email: customer.email,
      businessName: customer.businessName,
      gstNumber: customer.gstNumber,
      address: customer.address,
    };

    // Build product snapshots
    const itemsWithSnapshots = data.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        productSnapshot: {
          id: product.id,
          name: product.name,
          sku: product.sku,
          category: product.category,
          unitPrice: Number(product.unitPrice),
        },
      };
    });

    // Create challan in transaction
    const challan = await prisma.$transaction(async (tx) => {
      const newChallan = await tx.challan.create({
        data: {
          challanNumber,
          customerId: data.customerId,
          customerSnapshot,
          totalQuantity,
          status: data.status,
          createdBy: req.user!.userId,
          items: {
            create: itemsWithSnapshots,
          },
        },
        include: {
          items: true,
          customer: { select: { id: true, name: true, mobile: true } },
          createdByUser: { select: { id: true, name: true } },
        },
      });

      // If confirmed, deduct stock
      if (data.status === 'confirmed') {
        for (const item of data.items) {
          const product = products.find((p) => p.id === item.productId)!;
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: product.currentStock - item.quantity },
          });
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              movementType: 'OUT',
              reason: `Sales Challan: ${challanNumber}`,
              createdBy: req.user!.userId,
            },
          });
        }
      }

      return newChallan;
    });

    res.status(201).json({ success: true, data: challan });
  } catch (err) {
    next(err);
  }
};

export const updateChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: UpdateChallanInput = req.body;

    const existing = await prisma.challan.findUnique({
      where: { id: req.params.id as string },
      include: { items: true },
    });

    if (!existing) {
      return next(createError('Challan not found', 404));
    }

    if (existing.status !== 'draft') {
      return next(createError('Only draft challans can be edited', 400));
    }

    // Validate new customer if provided
    if (data.customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
      if (!customer) {
        return next(createError('Customer not found', 404));
      }
    }

    let itemsWithSnapshots: any;
    let totalQuantity = existing.totalQuantity;
    let customerSnapshot = existing.customerSnapshot;

    if (data.items) {
      const productIds = data.items.map((i) => i.productId);
      const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

      if (products.length !== productIds.length) {
        return next(createError('One or more products not found', 404));
      }

      totalQuantity = data.items.reduce((sum, i) => sum + i.quantity, 0);
      itemsWithSnapshots = data.items.map((item) => {
        const product = products.find((p) => p.id === item.productId)!;
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          productSnapshot: {
            id: product.id,
            name: product.name,
            sku: product.sku,
            category: product.category,
            unitPrice: Number(product.unitPrice),
          },
        };
      });
    }

    if (data.customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
      if (customer) {
        customerSnapshot = {
          id: customer.id,
          name: customer.name,
          mobile: customer.mobile,
          email: customer.email,
          businessName: customer.businessName,
          gstNumber: customer.gstNumber,
          address: customer.address,
        };
      }
    }

    const challan = await prisma.$transaction(async (tx) => {
      if (itemsWithSnapshots) {
        await tx.challanItem.deleteMany({ where: { challanId: req.params.id as string } });
      }

      return tx.challan.update({
        where: { id: req.params.id as string },
        data: {
          ...(data.customerId && { customerId: data.customerId, customerSnapshot }),
          ...(itemsWithSnapshots && {
            totalQuantity,
            items: { create: itemsWithSnapshots },
          }),
        },
        include: {
          items: true,
          customer: { select: { id: true, name: true, mobile: true } },
          createdByUser: { select: { id: true, name: true } },
        },
      });
    });

    res.json({ success: true, data: challan });
  } catch (err) {
    next(err);
  }
};

export const confirmChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.challan.findUnique({
      where: { id: req.params.id as string },
      include: { items: true },
    });

    if (!existing) {
      return next(createError('Challan not found', 404));
    }

    if (existing.status !== 'draft') {
      return next(createError(`Challan is already ${existing.status}`, 400));
    }

    // Fetch current stock for all products
    const productIds = existing.items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

    // Stock validation
    const stockErrors: string[] = [];
    for (const item of existing.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        stockErrors.push(`Product not found for item ${item.id}`);
        continue;
      }
      if (product.currentStock < item.quantity) {
        stockErrors.push(
          `Insufficient stock for "${product.name}" (SKU: ${product.sku}). Available: ${product.currentStock}, Requested: ${item.quantity}`
        );
      }
    }

    if (stockErrors.length > 0) {
      return next(createError('Stock check failed. Cannot confirm challan.', 409, stockErrors));
    }

    // Atomic: update challan status + deduct stock + create stock movements
    const challan = await prisma.$transaction(async (tx) => {
      const updated = await tx.challan.update({
        where: { id: req.params.id as string },
        data: { status: 'confirmed' },
        include: {
          items: true,
          customer: { select: { id: true, name: true, mobile: true } },
          createdByUser: { select: { id: true, name: true } },
        },
      });

      for (const item of existing.items) {
        const product = products.find((p) => p.id === item.productId)!;
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: product.currentStock - item.quantity },
        });
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            movementType: 'OUT',
            reason: `Sales Challan: ${existing.challanNumber}`,
            createdBy: req.user!.userId,
          },
        });
      }

      return updated;
    });

    res.json({ success: true, data: challan });
  } catch (err) {
    next(err);
  }
};

export const cancelChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.challan.findUnique({
      where: { id: req.params.id as string },
      include: { items: true },
    });

    if (!existing) {
      return next(createError('Challan not found', 404));
    }

    if (existing.status === 'cancelled') {
      return next(createError('Challan is already cancelled', 400));
    }

    // If challan was confirmed, reverse the stock
    const challan = await prisma.$transaction(async (tx) => {
      const updated = await tx.challan.update({
        where: { id: req.params.id as string },
        data: { status: 'cancelled' },
        include: {
          items: true,
          customer: { select: { id: true, name: true, mobile: true } },
          createdByUser: { select: { id: true, name: true } },
        },
      });

      if (existing.status === 'confirmed') {
        for (const item of existing.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { increment: item.quantity } },
          });
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              movementType: 'IN',
              reason: `Cancelled Challan: ${existing.challanNumber}`,
              createdBy: req.user!.userId,
            },
          });
        }
      }

      return updated;
    });

    res.json({ success: true, data: challan });
  } catch (err) {
    next(err);
  }
};
