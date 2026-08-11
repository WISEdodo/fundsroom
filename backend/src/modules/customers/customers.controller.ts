import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/database';
import { createError } from '../../middleware/errorHandler';
import { CreateCustomerInput, UpdateCustomerInput, AddFollowUpInput } from './customers.schema';

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || '';
    const status = req.query.status as string;
    const customerType = req.query.customerType as string;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (customerType) where.customerType = customerType;

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { followUps: true, challans: true } } },
      }),
      prisma.customer.count({ where }),
    ]);

    res.json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id as string },
      include: {
        followUps: {
          include: { user: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'desc' },
        },
        challans: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            challanNumber: true,
            status: true,
            totalQuantity: true,
            createdAt: true,
          },
        },
      },
    });

    if (!customer) {
      return next(createError('Customer not found', 404));
    }

    res.json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: CreateCustomerInput = req.body;

    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        mobile: data.mobile,
        email: data.email || null,
        businessName: data.businessName || null,
        gstNumber: data.gstNumber || null,
        customerType: data.customerType,
        address: data.address || null,
        status: data.status,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        notes: data.notes || null,
      },
    });

    res.status(201).json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: UpdateCustomerInput = req.body;

    const existing = await prisma.customer.findUnique({ where: { id: req.params.id as string } });
    if (!existing) {
      return next(createError('Customer not found', 404));
    }

    const customer = await prisma.customer.update({
      where: { id: req.params.id as string },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.mobile !== undefined && { mobile: data.mobile }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.businessName !== undefined && { businessName: data.businessName || null }),
        ...(data.gstNumber !== undefined && { gstNumber: data.gstNumber || null }),
        ...(data.customerType !== undefined && { customerType: data.customerType }),
        ...(data.address !== undefined && { address: data.address || null }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.followUpDate !== undefined && {
          followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
      },
    });

    res.json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

export const addFollowUp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { note }: AddFollowUpInput = req.body;
    const customerId = req.params.id as string;

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return next(createError('Customer not found', 404));
    }

    const followUp = await prisma.customerFollowUp.create({
      data: {
        customerId,
        note,
        createdBy: req.user!.userId,
      },
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
    });

    res.status(201).json({ success: true, data: followUp });
  } catch (err) {
    next(err);
  }
};
