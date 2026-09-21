import { PrismaClient } from '@prisma/client';
import { ShipmentStatus } from '../src/types/shipment';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with sample shipment records...');

  // Clear existing records safely
  await prisma.shipmentStatusHistory.deleteMany();
  await prisma.shipment.deleteMany();

  const now = new Date();

  // Helper date function
  const addDays = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return d;
  };

  const subDays = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d;
  };

  // 1. Delivered Shipment
  const s1 = await prisma.shipment.create({
    data: {
      referenceNumber: 'TRK-1001',
      origin: 'Shanghai Port, China',
      destination: 'Port of Los Angeles, CA, USA',
      currentStatus: ShipmentStatus.DELIVERED,
      expectedDeliveryDate: subDays(1),
      createdAt: subDays(10),
    },
  });

  await prisma.shipmentStatusHistory.createMany({
    data: [
      {
        shipmentId: s1.id,
        previousStatus: null,
        newStatus: ShipmentStatus.BOOKED,
        notes: 'Carrier booked and container assigned.',
        createdAt: subDays(10),
      },
      {
        shipmentId: s1.id,
        previousStatus: ShipmentStatus.BOOKED,
        newStatus: ShipmentStatus.IN_TRANSIT,
        notes: 'Vessel departed Shanghai hub.',
        createdAt: subDays(7),
      },
      {
        shipmentId: s1.id,
        previousStatus: ShipmentStatus.IN_TRANSIT,
        newStatus: ShipmentStatus.OUT_FOR_DELIVERY,
        notes: 'Discharged at LA terminal, dispatched via local courier.',
        createdAt: subDays(2),
      },
      {
        shipmentId: s1.id,
        previousStatus: ShipmentStatus.OUT_FOR_DELIVERY,
        newStatus: ShipmentStatus.DELIVERED,
        notes: 'Signed for by recipient at main warehouse.',
        createdAt: subDays(1),
      },
    ],
  });

  // 2. In Transit Shipment
  const s2 = await prisma.shipment.create({
    data: {
      referenceNumber: 'TRK-1002',
      origin: 'Hamburg Logistics Hub, Germany',
      destination: 'JFK Freight Terminal, NY, USA',
      currentStatus: ShipmentStatus.IN_TRANSIT,
      expectedDeliveryDate: addDays(4),
      createdAt: subDays(4),
    },
  });

  await prisma.shipmentStatusHistory.createMany({
    data: [
      {
        shipmentId: s2.id,
        previousStatus: null,
        newStatus: ShipmentStatus.BOOKED,
        notes: 'Export declaration filed.',
        createdAt: subDays(4),
      },
      {
        shipmentId: s2.id,
        previousStatus: ShipmentStatus.BOOKED,
        newStatus: ShipmentStatus.IN_TRANSIT,
        notes: 'Cargo loaded on vessel Atlantic Pioneer.',
        createdAt: subDays(2),
      },
    ],
  });

  // 3. Customs Hold Shipment
  const s3 = await prisma.shipment.create({
    data: {
      referenceNumber: 'TRK-1003',
      origin: 'Tokyo Narita Airport, Japan',
      destination: 'London Heathrow Gateway, UK',
      currentStatus: ShipmentStatus.CUSTOMS_HOLD,
      expectedDeliveryDate: addDays(2),
      createdAt: subDays(5),
    },
  });

  await prisma.shipmentStatusHistory.createMany({
    data: [
      {
        shipmentId: s3.id,
        previousStatus: null,
        newStatus: ShipmentStatus.BOOKED,
        notes: 'Air freight waybill issued.',
        createdAt: subDays(5),
      },
      {
        shipmentId: s3.id,
        previousStatus: ShipmentStatus.BOOKED,
        newStatus: ShipmentStatus.IN_TRANSIT,
        notes: 'Flight JL043 arrived at Heathrow.',
        createdAt: subDays(3),
      },
      {
        shipmentId: s3.id,
        previousStatus: ShipmentStatus.IN_TRANSIT,
        newStatus: ShipmentStatus.CUSTOMS_HOLD,
        notes: 'Held by UK Border Force for tariff valuation & documentation check.',
        createdAt: subDays(1),
      },
    ],
  });

  // 4. Out for Delivery Shipment
  const s4 = await prisma.shipment.create({
    data: {
      referenceNumber: 'TRK-1004',
      origin: 'Singapore Changi Air Freight, SG',
      destination: 'Sydney Kingsford Smith Airport, AU',
      currentStatus: ShipmentStatus.OUT_FOR_DELIVERY,
      expectedDeliveryDate: addDays(0),
      createdAt: subDays(6),
    },
  });

  await prisma.shipmentStatusHistory.createMany({
    data: [
      {
        shipmentId: s4.id,
        previousStatus: null,
        newStatus: ShipmentStatus.BOOKED,
        notes: 'Order confirmed and palleted.',
        createdAt: subDays(6),
      },
      {
        shipmentId: s4.id,
        previousStatus: ShipmentStatus.BOOKED,
        newStatus: ShipmentStatus.IN_TRANSIT,
        notes: 'In transit via Singapore Airlines Cargo.',
        createdAt: subDays(4),
      },
      {
        shipmentId: s4.id,
        previousStatus: ShipmentStatus.IN_TRANSIT,
        newStatus: ShipmentStatus.OUT_FOR_DELIVERY,
        notes: 'Loaded on local delivery truck 4B.',
        createdAt: subDays(0),
      },
    ],
  });

  // 5. Booked Shipment
  const s5 = await prisma.shipment.create({
    data: {
      referenceNumber: 'TRK-1005',
      origin: 'Port of Rotterdam, Netherlands',
      destination: 'Chicago Distribution Center, IL, USA',
      currentStatus: ShipmentStatus.BOOKED,
      expectedDeliveryDate: addDays(12),
      createdAt: subDays(1),
    },
  });

  await prisma.shipmentStatusHistory.create({
    data: {
      shipmentId: s5.id,
      previousStatus: null,
      newStatus: ShipmentStatus.BOOKED,
      notes: 'Initial booking accepted by ocean carrier.',
      createdAt: subDays(1),
    },
  });

  // 6. Customs Hold Shipment 2
  const s6 = await prisma.shipment.create({
    data: {
      referenceNumber: 'TRK-1006',
      origin: 'Mumbai Jawaharlal Nehru Port, India',
      destination: 'Toronto Pearson Cargo Hub, Canada',
      currentStatus: ShipmentStatus.CUSTOMS_HOLD,
      expectedDeliveryDate: addDays(6),
      createdAt: subDays(8),
    },
  });

  await prisma.shipmentStatusHistory.createMany({
    data: [
      {
        shipmentId: s6.id,
        previousStatus: null,
        newStatus: ShipmentStatus.BOOKED,
        notes: 'Booking confirmed.',
        createdAt: subDays(8),
      },
      {
        shipmentId: s6.id,
        previousStatus: ShipmentStatus.BOOKED,
        newStatus: ShipmentStatus.IN_TRANSIT,
        notes: 'Ocean transit in progress.',
        createdAt: subDays(5),
      },
      {
        shipmentId: s6.id,
        previousStatus: ShipmentStatus.IN_TRANSIT,
        newStatus: ShipmentStatus.CUSTOMS_HOLD,
        notes: 'Awaiting phytosanitary certificate clearance.',
        createdAt: subDays(2),
      },
    ],
  });

  console.log('✅ Seed completed successfully! Created 6 realistic shipments with complete status histories.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
