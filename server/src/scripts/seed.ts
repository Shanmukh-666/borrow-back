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

  console.log('[Seed] Cleaning up old test accounts, demo users, and listings...');

  // 1. Remove old demo users (explicitly removing Shanmukh Motupalli as requested)
  await User.deleteMany({
    $or: [
      { name: 'Shanmukh Motupalli' },
      { email: 'shanmukh@borrowback.community' },
      { email: 'shanmukh@bhimavaram.local' },
      { email: 'alice@example.com' },
      { email: 'bob@example.com' },
      { email: 'communityuser@example.com' },
      { email: 'maria@example.com' },
      { email: { $regex: /^maria_.*@example\.com$/i } },
      { email: { $regex: /^owner_.*@example\.com$/i } },
      { email: { $regex: /^borrower_.*@example\.com$/i } },
      { email: { $regex: /@bhimavaram\.local$/i } },
    ],
  });

  // 2. Remove all legacy sample listings
  await Item.deleteMany({});
  console.log('[Seed] Cleared legacy listings.');

  console.log('[Seed] Seeding 16 community members and listings with distinct owners...');

  const passwordHash = await bcrypt.hash('BorrowPass123!', 10);

  // 16 Distinct Community Members
  const usersData = [
    { name: 'Aditya Varma', email: 'aditya.varma@borrowback.community', passwordHash },
    { name: 'Ravi Teja Datla', email: 'raviteja.datla@borrowback.community', passwordHash },
    { name: 'Sai Krishna Pinninti', email: 'saikrishna@borrowback.community', passwordHash },
    { name: 'Sneha Reddy', email: 'sneha.reddy@borrowback.community', passwordHash },
    { name: 'Lakshmi Prasanna', email: 'lakshmi.prasanna@borrowback.community', passwordHash },
    { name: 'Kalyan Chakravarthy', email: 'kalyan.c@borrowback.community', passwordHash },
    { name: 'Pooja Sree', email: 'pooja.sree@borrowback.community', passwordHash },
    { name: 'Venkatesh Raju', email: 'venkatesh.raju@borrowback.community', passwordHash },
    { name: 'Naveen Kumar', email: 'naveen.kumar@borrowback.community', passwordHash },
    { name: 'Suresh Babu', email: 'suresh.babu@borrowback.community', passwordHash },
    { name: 'Manoj Varma', email: 'manoj.varma@borrowback.community', passwordHash },
    { name: 'Harsha Vardhan', email: 'harsha.vardhan@borrowback.community', passwordHash },
    { name: 'Ananya Chowdary', email: 'ananya.chowdary@borrowback.community', passwordHash },
    { name: 'Rohit Verma', email: 'rohit.verma@borrowback.community', passwordHash },
    { name: 'Bhavani Devi', email: 'bhavani.devi@borrowback.community', passwordHash },
    { name: 'Kiran Kumar', email: 'kiran.kumar@borrowback.community', passwordHash },
  ];

  const userMap = new Map<string, mongoose.Types.ObjectId>();

  for (const u of usersData) {
    const user = await User.findOneAndUpdate({ email: u.email }, u, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
    userMap.set(u.name, user._id as mongoose.Types.ObjectId);
    console.log(`[Seed] Community Member: ${user.name}`);
  }

  // 16 High-Quality Community Listings with 16 Unique Owners
  const sampleItems = [
    {
      owner: userMap.get('Aditya Varma'),
      title: 'Bosch Professional 18V Cordless Drill & Impact Driver Set',
      description:
        'Includes 2 rechargeable 4.0Ah batteries, rapid charger, and complete 20-piece masonry drill bit set. Perfect for home wall mounting, woodwork, or DIY maintenance in Chinna Amiram.',
      category: 'Tools & DIY',
      condition: 'Like New',
      pickupNote: 'Chinna Amiram, Near SRKR Engineering College Gate 2',
      imageUrl: '/images/items/cordless-drill.jpg',
      status: 'active',
    },
    {
      owner: userMap.get('Ravi Teja Datla'),
      title: 'Sony Alpha 4K Mirrorless Camera with 28-70mm Lens',
      description:
        'High resolution 4K mirrorless camera with fast autofocus, 64GB Extreme Pro SD card, neck strap, and extra battery. Perfect for college fests, family functions, or scenic travel photography.',
      category: 'Electronics',
      condition: 'Like New',
      pickupNote: 'Near Someswara Swamy Temple Arch, Gunupudi',
      imageUrl: '/images/items/mirrorless-camera.jpg',
      status: 'active',
    },
    {
      owner: userMap.get('Sai Krishna Pinninti'),
      title: 'Higher Engineering Mathematics (B.S. Grewal - 44th Edition)',
      description:
        'Standard comprehensive textbook for engineering mathematics (M1, M2, M3). Completely clean pages with zero pencil markings. Formula summary sheets included. Essential for university exams.',
      category: 'Books & Study',
      condition: 'Good',
      pickupNote: 'DNR College Ground Canteen / Association Hall',
      imageUrl: '/images/items/engineering-maths.jpg',
      status: 'active',
    },
    {
      owner: userMap.get('Sneha Reddy'),
      title: 'Coleman 4-Person Waterproof Camping Tent with Groundsheet',
      description:
        'Fast 5-minute setup instant dome tent with waterproof rainfly and durable groundsheet. Great for weekend getaways to Dindi resorts, Perupalem beach, or riverbank camping trips.',
      category: 'Sports & Outdoors',
      condition: 'Good',
      pickupNote: 'Near Palakollu Ksheera Ramalingeswara Temple Bypass Road',
      imageUrl: '/images/items/camping-tent.jpg',
      status: 'active',
    },
    {
      owner: userMap.get('Lakshmi Prasanna'),
      title: 'Preethi Zodiac 750W Heavy-Duty Mixer Grinder & Processor',
      description:
        'Equipped with 5 jars including atta kneading master jar, citrus juicing jar, and 3 heavy-gauge stainless steel grinding jars. Ideal for festival cooking, dosas, and large family catering.',
      category: 'Home & Kitchen',
      condition: 'Like New',
      pickupNote: 'Mavullamma Ammavari Temple Car Street, Town Center',
      imageUrl: '/images/items/mixer-grinder.jpg',
      status: 'active',
    },
    {
      owner: userMap.get('Kalyan Chakravarthy'),
      title: 'Epson Full HD Portable Projector with 100-inch Screen',
      description:
        'Crisp 3400 lumens 1080p projection with HDMI input and loud built-in speaker. Comes with a tripod stand and foldable 100-inch white projection screen. Wonderful for IPL cricket nights and project presentations.',
      category: 'Event & Presentation',
      condition: 'Like New',
      pickupNote: 'J.P. Road, Opposite Gandhi Bomma Centre',
      imageUrl: '/images/items/projector.jpg',
      status: 'active',
    },
    {
      owner: userMap.get('Pooja Sree'),
      title: 'Casio fx-991EX ClassWiz Scientific Engineering Calculator',
      description:
        'Approved non-programmable engineering calculator with high-resolution LCD, matrix operations, equation solver, and QR code visualization. Essential for engineering semester exams.',
      category: 'Books & Study',
      condition: 'Like New',
      pickupNote: 'SRKR Mechanical Block / Canteen Junction, Chinna Amiram',
      imageUrl: '/images/items/calculator.jpg',
      status: 'active',
    },
    {
      owner: userMap.get('Venkatesh Raju'),
      title: 'Firefox Target 21-Speed All-Terrain Mountain Bicycle',
      description:
        'Lightweight alloy frame, front mechanical disc brakes, smooth Shimano 21-speed gears, and front suspension. Well-oiled and serviced, ideal for fitness rides along canals and town roads.',
      category: 'Sports & Outdoors',
      condition: 'Good',
      pickupNote: 'Balusumudi Main Road, Near Rest House',
      imageUrl: '/images/items/mountain-bike.jpg',
      status: 'active',
    },
    {
      owner: userMap.get('Naveen Kumar'),
      title: 'DJI Osmo Mobile 6 Smartphone Gimbal Stabilizer',
      description:
        '3-axis active tracking phone stabilizer with built-in extension rod, magnetic phone clamp, and mini tripod. Smooth cinematic video for Instagram reels, college projects, and travel vlogs.',
      category: 'Electronics',
      condition: 'Like New',
      pickupNote: 'Town Railway Station Platform 1 Exit, Old Bus Stand',
      imageUrl: '/images/items/gimbal.jpg',
      status: 'active',
    },
    {
      owner: userMap.get('Suresh Babu'),
      title: 'Synco 32-inch Tournament Grade Carrom Board with Striker',
      description:
        'Heavy English birch plywood tournament carrom board with fast waterproof surface, complete set of wooden coins, tournament striker, and boric powder. Great for weekend family games.',
      category: 'Other',
      condition: 'Like New',
      pickupNote: 'Near Tanuku Road Overbridge, Tadepalligudem Link Road',
      imageUrl: '/images/items/carrom-board.jpg',
      status: 'active',
    },
    {
      owner: userMap.get('Manoj Varma'),
      title: 'Yamaha F280 Acoustic Guitar with Padded Gig Bag & Capo',
      description:
        'Natural spruce top acoustic guitar with bright resonance and comfortable low action. Includes durable padded carry bag, digital clip-on tuner, capo, and picks. Ideal for acoustic practice and college music clubs.',
      category: 'Other',
      condition: 'Like New',
      pickupNote: 'Housing Board Colony, Near Water Tank Park',
      imageUrl: '/images/items/acoustic-guitar.jpg',
      status: 'active',
    },
    {
      owner: userMap.get('Harsha Vardhan'),
      title: 'Stanley 65-Piece Home Hand Tool & Mechanics Socket Kit',
      description:
        'Heavy duty chrome-vanadium tool set featuring quick-release ratchet, metric sockets, precision screwdrivers, combination pliers, hex keys, and tape measure. Packed in a sturdy blow-mold case.',
      category: 'Tools & DIY',
      condition: 'Like New',
      pickupNote: 'Rest House Road, Near Sub-Registrar Office',
      imageUrl: '/images/items/hand-tools.jpg',
      status: 'active',
    },
    {
      owner: userMap.get('Ananya Chowdary'),
      title: 'JBL PartyBox Portable Bluetooth Speaker with Wireless Mic',
      description:
        'Powerful 100W party speaker with deep bass boost, dynamic LED light show, and 12-hour rechargeable battery. Comes with wireless microphone. Fantastic for birthday parties and campus cultural practices.',
      category: 'Event & Presentation',
      condition: 'Like New',
      pickupNote: 'Bypass Road, Near HP Petrol Bunk Plaza',
      imageUrl: '/images/items/party-speaker.jpg',
      status: 'active',
    },
    {
      owner: userMap.get('Rohit Verma'),
      title: 'Introduction to Algorithms (CLRS - 4th Edition)',
      description:
        'The definitive comprehensive algorithms reference by Cormen, Leiserson, Rivest, and Stein. Hardcover in pristine condition with no markings. Crucial for GATE preparation and technical coding interviews.',
      category: 'Books & Study',
      condition: 'Like New',
      pickupNote: 'SRKR Central Library Entrance / Cyber Block',
      imageUrl: '/images/items/algorithms-book.jpg',
      status: 'active',
    },
    {
      owner: userMap.get('Bhavani Devi'),
      title: 'Philips Digital Air Fryer 4.1L Rapid Air Technology',
      description:
        'Touch screen digital air fryer with 7 preset cooking programs and auto-shutoff. Fries snacks, samosas, roasted corn, and grilled veggies using up to 90% less oil. Cleaned and sanitized.',
      category: 'Home & Kitchen',
      condition: 'Like New',
      pickupNote: 'Sunday Market Road, Near Vegetable Market Center',
      imageUrl: '/images/items/air-fryer.jpg',
      status: 'active',
    },
    {
      owner: userMap.get('Kiran Kumar'),
      title: 'Yonex Carbonex Graphite Badminton Rackets Pair with Shuttle Tube',
      description:
        'Pair of lightweight graphite-aluminum tournament badminton rackets with durable BG-65 strings and sweat-absorbent grips. Includes padded double racquet bag and 1 tube of 6 nylon shuttles.',
      category: 'Sports & Outdoors',
      condition: 'Good',
      pickupNote: 'DNR Indoor Stadium / Badminton Court Entrance',
      imageUrl: '/images/items/badminton-rackets.jpg',
      status: 'active',
    },
  ];

  for (const itemData of sampleItems) {
    await Item.create(itemData);
  }

  console.log(`[Seed] Created ${sampleItems.length} distinct community listings with 16 unique owners!`);
  console.log('[Seed] Database seed completed successfully.');
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
