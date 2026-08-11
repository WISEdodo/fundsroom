/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create users for all 4 roles
  const passwordHash = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@erp.com' },
      update: {},
      create: { name: 'Admin User', email: 'admin@erp.com', passwordHash, role: 'admin' },
    }),
    prisma.user.upsert({
      where: { email: 'sales@erp.com' },
      update: {},
      create: { name: 'Sales Manager', email: 'sales@erp.com', passwordHash, role: 'sales' },
    }),
    prisma.user.upsert({
      where: { email: 'warehouse@erp.com' },
      update: {},
      create: { name: 'Warehouse Staff', email: 'warehouse@erp.com', passwordHash, role: 'warehouse' },
    }),
    prisma.user.upsert({
      where: { email: 'accounts@erp.com' },
      update: {},
      create: { name: 'Accounts Team', email: 'accounts@erp.com', passwordHash, role: 'accounts' },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create sample customers
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { id: 'c1000000-0000-0000-0000-000000000001' },
      update: {},
      create: {
        id: 'c1000000-0000-0000-0000-000000000001',
        name: 'Rajesh Sharma',
        mobile: '9876543210',
        email: 'rajesh@sharma.com',
        businessName: 'Sharma Traders',
        gstNumber: '27AAPFU0939F1ZV',
        customerType: 'wholesale',
        address: '12, Market Road, Mumbai, Maharashtra 400001',
        status: 'active',
        followUpDate: new Date('2026-08-15'),
        notes: 'Key account. Prefers early morning calls.',
      },
    }),
    prisma.customer.upsert({
      where: { id: 'c2000000-0000-0000-0000-000000000002' },
      update: {},
      create: {
        id: 'c2000000-0000-0000-0000-000000000002',
        name: 'Priya Patel',
        mobile: '8765432109',
        email: 'priya@pvdistributors.com',
        businessName: 'PV Distributors',
        gstNumber: '24AAACR5055K1ZB',
        customerType: 'distributor',
        address: '45, Ring Road, Ahmedabad, Gujarat 380001',
        status: 'active',
        notes: 'Monthly orders. Net 30 payment terms.',
      },
    }),
    prisma.customer.upsert({
      where: { id: 'c3000000-0000-0000-0000-000000000003' },
      update: {},
      create: {
        id: 'c3000000-0000-0000-0000-000000000003',
        name: 'Amit Kumar',
        mobile: '7654321098',
        businessName: 'Kumar Retail',
        customerType: 'retail',
        address: '8, Gandhi Nagar, Delhi 110001',
        status: 'lead',
        followUpDate: new Date('2026-08-12'),
        notes: 'Interested in electronics category. Need demo.',
      },
    }),
  ]);

  console.log(`✅ Created ${customers.length} customers`);

  // Create sample products
  const adminUser = users[0];
  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'ELEC-001' },
      update: {},
      create: {
        name: 'Wireless Bluetooth Speaker',
        sku: 'ELEC-001',
        category: 'Electronics',
        unitPrice: 1500.00,
        currentStock: 150,
        minStockAlert: 20,
        location: 'Warehouse A - Shelf 1',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'ELEC-002' },
      update: {},
      create: {
        name: 'USB-C Hub 7-in-1',
        sku: 'ELEC-002',
        category: 'Electronics',
        unitPrice: 899.00,
        currentStock: 8,
        minStockAlert: 10,
        location: 'Warehouse A - Shelf 2',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'APPL-001' },
      update: {},
      create: {
        name: 'Stainless Steel Water Bottle 1L',
        sku: 'APPL-001',
        category: 'Appliances',
        unitPrice: 350.00,
        currentStock: 500,
        minStockAlert: 50,
        location: 'Warehouse B - Rack 3',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'APPL-002' },
      update: {},
      create: {
        name: 'Electric Kettle 1.5L',
        sku: 'APPL-002',
        category: 'Appliances',
        unitPrice: 750.00,
        currentStock: 5,
        minStockAlert: 10,
        location: 'Warehouse B - Rack 4',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'STAT-001' },
      update: {},
      create: {
        name: 'Premium Ball Pen Box (10 pcs)',
        sku: 'STAT-001',
        category: 'Stationery',
        unitPrice: 120.00,
        currentStock: 1000,
        minStockAlert: 100,
        location: 'Warehouse C - Bin 1',
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);

  // Create initial stock movements
  for (const product of products) {
    const existingMovement = await prisma.stockMovement.findFirst({
      where: { productId: product.id, reason: 'Initial stock' },
    });

    if (!existingMovement && product.currentStock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          quantity: product.currentStock,
          movementType: 'IN',
          reason: 'Initial stock',
          createdBy: adminUser.id,
        },
      });
    }
  }

  // Create a sample follow-up
  const existingFollowUp = await prisma.customerFollowUp.findFirst({
    where: { customerId: 'c1000000-0000-0000-0000-000000000001' },
  });

  if (!existingFollowUp) {
    await prisma.customerFollowUp.create({
      data: {
        customerId: 'c1000000-0000-0000-0000-000000000001',
        note: 'Called Rajesh regarding Q3 order. He will send PO by end of week.',
        createdBy: users[1].id,
      },
    });
  }

  console.log('✅ Created stock movements and follow-ups');
  console.log('\n🎉 Seeding complete!');
  console.log('\n📋 Test Credentials:');
  console.log('   Admin:     admin@erp.com     / password123');
  console.log('   Sales:     sales@erp.com     / password123');
  console.log('   Warehouse: warehouse@erp.com / password123');
  console.log('   Accounts:  accounts@erp.com  / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);  
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
