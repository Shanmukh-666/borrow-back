import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Item } from '../models/Item';

export const seedDatabase = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seed script cannot be executed in production environment.');
  }

  console.log('[Seed] Cleaning up old foreign/test accounts and listings...');

  // 1. Remove all old foreign/test users from database (preserve real user accounts like shanmukh@gmail.com)
  const deletedUsersResult = await User.deleteMany({
    email: {
      $in: [
        'alice@example.com',
        'bob@example.com',
        'communityuser@example.com',
        'maria@example.com',
      ],
    },
  });
  console.log(`[Seed] Removed ${deletedUsersResult.deletedCount} legacy demo users.`);

  // Also remove old auto-generated demo users
  await User.deleteMany({
    $or: [
      { email: { $regex: /^maria_.*@example\.com$/i } },
      { email: { $regex: /^owner_.*@example\.com$/i } },
      { email: { $regex: /^borrower_.*@example\.com$/i } },
    ],
  });

  // 2. Remove old foreign listings from the catalog completely
  const deletedItemsResult = await Item.deleteMany({
    title: {
      $in: [
        'Telescope Celestron AstroMaster 130EQ',
        'DeWalt 20V Max Cordless Drill',
        'Catan & Ticket to Ride Board Game Bundle',
        'Portable Dual-Sided Magnetic Whiteboard & Easel',
        'KitchenAid Artisan 5-Quart Stand Mixer',
        'Coleman 4-Person Instant Cabin Tent',
        'Calculus: Early Transcendentals (8th Edition)',
        'Epson Home Cinema 1080p HD Projector',
        'Bosch 18V Cordless Hammer Drill Set',
        'carrrom borad',
      ],
    },
  });
  console.log(`[Seed] Removed ${deletedItemsResult.deletedCount} legacy non-local listings.`);

  console.log('[Seed] Seeding authentic Bhimavaram & West Godavari community listings...');

  const passwordHash = await bcrypt.hash('BorrowPass123!', 10);

  // 3. Authentic Local Telugu Community Members (Bhimavaram & West Godavari)
  const usersData = [
    {
      name: 'Shanmukh Motupalli',
      email: 'shanmukh@bhimavaram.local',
      passwordHash,
    },
    {
      name: 'Ravi Varma Datla',
      email: 'ravi.varma@bhimavaram.local',
      passwordHash,
    },
    {
      name: 'Sneha Reddy',
      email: 'sneha.reddy@bhimavaram.local',
      passwordHash,
    },
    {
      name: 'Sai Krishna Pinninti',
      email: 'saikrishna@bhimavaram.local',
      passwordHash,
    },
  ];

  const seededUsers = [];
  for (const u of usersData) {
    const user = await User.findOneAndUpdate({ email: u.email }, u, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
    seededUsers.push(user);
    console.log(`[Seed] Verified Member: ${user.name} (${user.email})`);
  }

  const [shanmukh, ravi, sneha, sai] = seededUsers;

  // 4. Clean, High-Definition Local Listings with verified local images in /images/items/
  const sampleItems = [
    {
      owner: shanmukh._id,
      title: 'Bosch Professional 18V Cordless Drill & Impact Set',
      description:
        'Includes 2 rechargeable 4.0Ah batteries, rapid charger, and complete 20-piece masonry drill bit set. Perfect for home wall mounting, woodwork, or DIY maintenance in Chinna Amiram.',
      category: 'Tools & DIY',
      condition: 'Like New',
      pickupNote: 'Chinna Amiram, Near SRKR Engineering College Gate 2, Bhimavaram',
      imageUrl: '/images/items/cordless-drill.jpg',
      status: 'active',
    },
    {
      owner: ravi._id,
      title: 'Sony Alpha 4K Mirrorless Camera with 28-70mm Lens',
      description:
        'High resolution 4K mirrorless camera with fast autofocus, 64GB Extreme Pro SD card, neck strap, and extra battery. Perfect for college fests, family functions, or Godavari river photography.',
      category: 'Electronics',
      condition: 'Like New',
      pickupNote: 'Near Someswara Swamy Temple Arch, Gunupudi, Bhimavaram',
      imageUrl: '/images/items/mirrorless-camera.jpg',
      status: 'active',
    },
    {
      owner: sai._id,
      title: 'Higher Engineering Mathematics (B.S. Grewal - 44th Edition)',
      description:
        'Standard comprehensive textbook for engineering mathematics (M1, M2, M3). Completely clean pages with zero pencil markings. Formula summary sheets included. Essential for JNTUK/AU syllabus.',
      category: 'Books & Study',
      condition: 'Good',
      pickupNote: 'DNR College Ground Canteen / Association Hall, Bhimavaram',
      imageUrl: '/images/items/engineering-maths.jpg',
      status: 'active',
    },
    {
      owner: sneha._id,
      title: 'Coleman 4-Person Waterproof Camping Tent with Groundsheet',
      description:
        'Fast 5-minute setup instant dome tent with waterproof rainfly and durable groundsheet. Great for weekend getaways to Dindi resorts, Perupalem beach, or Godavari riverbank camping trips.',
      category: 'Sports & Outdoors',
      condition: 'Good',
      pickupNote: 'Near Palakollu Ksheera Ramalingeswara Temple Bypass Road',
      imageUrl: '/images/items/camping-tent.jpg',
      status: 'active',
    },
    {
      owner: sneha._id,
      title: 'Preethi Zodiac 750W Heavy-Duty Mixer Grinder & Processor',
      description:
        'Equipped with 5 jars including atta kneading master jar, citrus juicing jar, and 3 heavy-gauge stainless steel grinding jars. Ideal for festival cooking, dosas, and large family catering.',
      category: 'Home & Kitchen',
      condition: 'Like New',
      pickupNote: 'Mavullamma Ammavari Temple Car Street, Bhimavaram Town Center',
      imageUrl: '/images/items/mixer-grinder.jpg',
      status: 'active',
    },
    {
      owner: ravi._id,
      title: 'Epson Full HD Portable Projector with 100-inch Screen',
      description:
        'Crisp 3400 lumens 1080p projection with HDMI input and loud built-in speaker. Comes with a tripod stand and foldable 100-inch white projection screen. Wonderful for IPL cricket nights and project presentations.',
      category: 'Event & Presentation',
      condition: 'Like New',
      pickupNote: 'J.P. Road, Opposite Gandhi Bomma Centre, Bhimavaram',
      imageUrl: '/images/items/projector.jpg',
      status: 'active',
    },
    {
      owner: sai._id,
      title: 'Casio fx-991EX ClassWiz Scientific Engineering Calculator',
      description:
        'Approved non-programmable engineering calculator with high-resolution LCD, matrix operations, equation solver, and QR code visualization. Recommended for SRKR and DNR engineering exams.',
      category: 'Books & Study',
      condition: 'Like New',
      pickupNote: 'SRKR Mechanical Block / Canteen Junction, Chinna Amiram, Bhimavaram',
      imageUrl: '/images/items/calculator.jpg',
      status: 'active',
    },
    {
      owner: shanmukh._id,
      title: 'Firefox Target 21-Speed All-Terrain Mountain Bicycle',
      description:
        'Lightweight alloy frame, front mechanical disc brakes, smooth Shimano 21-speed gears, and front suspension. Well-oiled and serviced, ideal for fitness rides along Bhimavaram and Undi canals.',
      category: 'Sports & Outdoors',
      condition: 'Good',
      pickupNote: 'Balusumudi Main Road, Near Rest House, Bhimavaram',
      imageUrl: '/images/items/mountain-bike.jpg',
      status: 'active',
    },
    {
      owner: ravi._id,
      title: 'DJI Osmo Mobile 6 Smartphone Gimbal Stabilizer',
      description:
        '3-axis active tracking phone stabilizer with built-in extension rod, magnetic phone clamp, and mini tripod. Smooth cinematic video for Instagram reels, college projects, and travel vlogs.',
      category: 'Electronics',
      condition: 'Like New',
      pickupNote: 'Bhimavaram Town Railway Station Platform 1 Exit, Old Bus Stand',
      imageUrl: '/images/items/gimbal.jpg',
      status: 'active',
    },
    {
      owner: shanmukh._id,
      title: 'Synco 32-inch Tournament Grade Carrom Board with Striker',
      description:
        'Heavy English birch plywood tournament carrom board with fast waterproof surface, complete set of wooden coins, tournament striker, and boric powder. Great for weekend family games.',
      category: 'Other',
      condition: 'Like New',
      pickupNote: 'Near Tanuku Road Overbridge, Tadepalligudem / Bhimavaram Link Road',
      imageUrl: '/images/items/carrom-board.jpg',
      status: 'active',
    },
  ];

  for (const itemData of sampleItems) {
    await Item.findOneAndUpdate(
      { title: itemData.title },
      itemData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log(`[Seed] Created / verified ${sampleItems.length} pristine Bhimavaram local listings with fast local images.`);
  console.log('[Seed] Database cleanup and seed completed successfully.');
};

// Execute if run directly
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('[Seed Error]:', err);
      process.exit(1);
    }
  })();
}
