import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create test users
  const user1 = await prisma.user.upsert({
    where: { email: 'test1@example.com' },
    update: {},
    create: {
      email: 'test1@example.com',
      name: 'Test User 1',
      googleId: 'test-google-id-1',
      profileImage: 'https://via.placeholder.com/150',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'test2@example.com' },
    update: {},
    create: {
      email: 'test2@example.com',
      name: 'Test User 2',
      googleId: 'test-google-id-2',
      profileImage: 'https://via.placeholder.com/150',
    },
  });

  // Create test events
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(18, 0, 0, 0);

  const endTime = new Date(tomorrow);
  endTime.setHours(20, 0, 0, 0);

  const event1 = await prisma.event.create({
    data: {
      title: 'Beginner Pickleball Meetup',
      description: 'Join us for a fun beginner-friendly pickleball session!',
      location: 'Central Park Courts',
      startTime: tomorrow,
      endTime: endTime,
      maxParticipants: 8,
      skillLevel: 'beginner',
      creatorId: user1.id,
    },
  });

  // Create chat room for event
  const chatRoom = await prisma.chatRoom.create({
    data: {
      eventId: event1.id,
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
