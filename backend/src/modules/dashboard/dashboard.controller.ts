import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/database';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalCustomers = await prisma.customer.count();
    
    // Find products where currentStock <= minStockAlert
    // Prisma currently doesn't support comparing two columns directly in a basic where clause,
    // so we'll fetch products and filter, or use raw query. For simplicity and since it's a mini ERP, we'll fetch and filter.
    const products = await prisma.product.findMany({
      select: { currentStock: true, minStockAlert: true }
    });
    const lowStockItems = products.filter(p => p.currentStock <= p.minStockAlert).length;

    const pendingChallans = await prisma.challan.count({
      where: { status: 'draft' }
    });

    // Monthly Sales (simplified to count of confirmed challans this month for this example)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyConfirmed = await prisma.challan.count({
      where: { 
        status: 'confirmed',
        createdAt: { gte: startOfMonth }
      }
    });

    res.json({
      success: true,
      data: {
        totalCustomers,
        lowStockItems,
        pendingChallans,
        monthlySales: monthlyConfirmed // Just showing a count of confirmed sales instead of $ for simplicity
      }
    });
  } catch (error) {
    next(error);
  }
};
