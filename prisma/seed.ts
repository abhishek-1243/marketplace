import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const password = await bcrypt.hash("password123", 10);

  // Create producers
  const rahul = await prisma.user.upsert({
    where: { email: "rahul@example.com" },
    update: {},
    create: {
      email: "rahul@example.com",
      username: "rahulbeats",
      displayName: "Rahul Beats",
      passwordHash: password,
      role: "PRODUCER",
      bio: "Mumbai-based producer crafting Trap, Hip-Hop & R&B beats. 5+ years of experience.",
      genres: JSON.stringify(["Trap", "Hip-Hop", "R&B"]),
      instagram: "rahulbeats",
      youtube: "RahulBeatsOfficial",
      verified: true,
      profileImage: "https://picsum.photos/seed/rahul/200/200",
      banner: "https://picsum.photos/seed/rahulbanner/1200/400",
    },
  });

  const priya = await prisma.user.upsert({
    where: { email: "priya@example.com" },
    update: {},
    create: {
      email: "priya@example.com",
      username: "priyasounds",
      displayName: "Priya Sounds",
      passwordHash: password,
      role: "PRODUCER",
      bio: "Delhi-based producer. Lo-fi, Pop & Bollywood fusion beats.",
      genres: JSON.stringify(["Lo-fi", "Pop", "Bollywood"]),
      instagram: "priyasounds",
      verified: true,
      profileImage: "https://picsum.photos/seed/priya/200/200",
      banner: "https://picsum.photos/seed/priyabanner/1200/400",
    },
  });

  const arjun = await prisma.user.upsert({
    where: { email: "arjun@example.com" },
    update: {},
    create: {
      email: "arjun@example.com",
      username: "arjunmusic",
      displayName: "Arjun Music",
      passwordHash: password,
      role: "PRODUCER",
      bio: "Bangalore producer. Drill, Afrobeat & experimental sounds.",
      genres: JSON.stringify(["Drill", "Afrobeat", "Experimental"]),
      verified: true,
      profileImage: "https://picsum.photos/seed/arjun/200/200",
      banner: "https://picsum.photos/seed/arjunbanner/1200/400",
    },
  });

  const karan = await prisma.user.upsert({
    where: { email: "karan@example.com" },
    update: {},
    create: {
      email: "karan@example.com",
      username: "karanwaves",
      displayName: "Karan Waves",
      passwordHash: password,
      role: "PRODUCER",
      bio: "Hyderabad-based producer. EDM, Pop & Trap fusion with cinematic textures.",
      genres: JSON.stringify(["EDM", "Pop", "Trap"]),
      instagram: "karanwaves",
      youtube: "KaranWavesMusic",
      verified: true,
      profileImage: "https://picsum.photos/seed/karan/200/200",
      banner: "https://picsum.photos/seed/karanbanner/1200/400",
    },
  });

  // Create artists
  const artist1 = await prisma.user.upsert({
    where: { email: "artist1@example.com" },
    update: {},
    create: {
      email: "artist1@example.com",
      username: "vikasr",
      displayName: "Vikas R",
      passwordHash: password,
      role: "ARTIST",
      profileImage: "https://picsum.photos/seed/vikas/200/200",
    },
  });

  const artist2 = await prisma.user.upsert({
    where: { email: "artist2@example.com" },
    update: {},
    create: {
      email: "artist2@example.com",
      username: "nehavoice",
      displayName: "Neha Voice",
      passwordHash: password,
      role: "ARTIST",
      profileImage: "https://picsum.photos/seed/neha/200/200",
    },
  });

  // Admin
  await prisma.user.upsert({
    where: { email: "admin@beatmarket.in" },
    update: {},
    create: {
      email: "admin@beatmarket.in",
      username: "admin",
      displayName: "Admin",
      passwordHash: password,
      role: "ADMIN",
    },
  });

  // Create beats for Rahul
  const beatData = [
    {
      title: "Midnight",
      slug: "midnight",
      genre: "Trap",
      mood: "Dark",
      bpm: 140,
      musicalKey: "F#m",
      tags: JSON.stringify(["dark", "trap", "hard", "808"]),
      description: "Dark trap beat with heavy 808s and atmospheric melodies.",
      plays: 8420,
      coverArt: "/images/beat-cover.jpg",
      previewUrl: "/audio/preview-placeholder.mp3",
    },
    {
      title: "Bombay Nights",
      slug: "bombay-nights",
      genre: "Hip-Hop",
      mood: "Chill",
      bpm: 95,
      musicalKey: "Am",
      tags: JSON.stringify(["chill", "hiphop", "vibes", "night"]),
      description: "Smooth hip-hop beat with Indian-influenced melodies.",
      plays: 4280,
      coverArt: "/images/beat-cover.jpg",
      previewUrl: "/audio/preview-placeholder.mp3",
    },
    {
      title: "No Sleep",
      slug: "no-sleep",
      genre: "Trap",
      mood: "Energetic",
      bpm: 150,
      musicalKey: "Cm",
      tags: JSON.stringify(["energetic", "trap", "hype", "club"]),
      description: "High energy trap beat for late-night sessions.",
      plays: 3100,
      coverArt: "/images/beat-cover.jpg",
      previewUrl: "/audio/preview-placeholder.mp3",
    },
    {
      title: "After Hours",
      slug: "after-hours",
      genre: "R&B",
      mood: "Smooth",
      bpm: 82,
      musicalKey: "Ebm",
      tags: JSON.stringify(["rnb", "smooth", "late", "soulful"]),
      description: "Smooth R&B beat with soulful chords and soft drums.",
      plays: 2800,
      coverArt: "/images/beat-cover.jpg",
      previewUrl: "/audio/preview-placeholder.mp3",
    },
  ];

  for (const bd of beatData) {
    const beat = await prisma.beat.create({
      data: {
        ...bd,
        producerId: rahul.id,
        status: "PUBLISHED",
      },
    });

    await prisma.licensePlan.createMany({
      data: [
        {
          beatId: beat.id,
          type: "BASIC",
          price: 999,
          includesMp3: true,
          includesWav: false,
          includesStems: false,
          streamingLimit: "500000",
          videoLimit: "1",
        },
        {
          beatId: beat.id,
          type: "PREMIUM",
          price: 2999,
          includesMp3: true,
          includesWav: true,
          includesStems: false,
          streamingLimit: "UNLIMITED",
          videoLimit: "UNLIMITED",
        },
        {
          beatId: beat.id,
          type: "EXCLUSIVE",
          price: 25000,
          includesMp3: true,
          includesWav: true,
          includesStems: true,
          isExclusive: true,
          streamingLimit: "UNLIMITED",
          videoLimit: "UNLIMITED",
        },
      ],
    });
  }

  // Beats for Priya
  const priyaBeats = [
    {
      title: "Chai & Chill",
      slug: "chai-and-chill",
      genre: "Lo-fi",
      mood: "Relaxed",
      bpm: 75,
      musicalKey: "G",
      tags: JSON.stringify(["lofi", "chill", "study", "relaxed"]),
      description: "Lo-fi chill beat perfect for studying or relaxing.",
      plays: 5600,
      coverArt: "/images/beat-cover.jpg",
      previewUrl: "/audio/preview-placeholder.mp3",
    },
    {
      title: "Neon Dreams",
      slug: "neon-dreams",
      genre: "Pop",
      mood: "Upbeat",
      bpm: 120,
      musicalKey: "C",
      tags: JSON.stringify(["pop", "upbeat", "catchy", "modern"]),
      description: "Catchy pop beat with modern synths and bouncy drums.",
      plays: 3200,
      coverArt: "/images/beat-cover.jpg",
      previewUrl: "/audio/preview-placeholder.mp3",
    },
    {
      title: "Monsoon",
      slug: "monsoon",
      genre: "Bollywood",
      mood: "Emotional",
      bpm: 88,
      musicalKey: "Dm",
      tags: JSON.stringify(["bollywood", "emotional", "rain", "cinematic"]),
      description: "Emotional Bollywood-inspired beat with cinematic elements.",
      plays: 7100,
      coverArt: "/images/beat-cover.jpg",
      previewUrl: "/audio/preview-placeholder.mp3",
    },
  ];

  for (const bd of priyaBeats) {
    const beat = await prisma.beat.create({
      data: { ...bd, producerId: priya.id, status: "PUBLISHED" },
    });
    await prisma.licensePlan.createMany({
      data: [
        { beatId: beat.id, type: "BASIC", price: 799, includesMp3: true, streamingLimit: "500000", videoLimit: "1" },
        { beatId: beat.id, type: "PREMIUM", price: 2499, includesMp3: true, includesWav: true, streamingLimit: "UNLIMITED", videoLimit: "UNLIMITED" },
        { beatId: beat.id, type: "EXCLUSIVE", price: 20000, includesMp3: true, includesWav: true, includesStems: true, isExclusive: true, streamingLimit: "UNLIMITED", videoLimit: "UNLIMITED" },
      ],
    });
  }

  // Beats for Arjun
  const arjunBeats = [
    {
      title: "Street Code",
      slug: "street-code",
      genre: "Drill",
      mood: "Aggressive",
      bpm: 145,
      musicalKey: "Bbm",
      tags: JSON.stringify(["drill", "aggressive", "street", "dark"]),
      description: "Hard-hitting drill beat with sliding 808s.",
      plays: 4500,
      coverArt: "/images/beat-cover.jpg",
      previewUrl: "/audio/preview-placeholder.mp3",
    },
    {
      title: "Lagos to Bangalore",
      slug: "lagos-to-bangalore",
      genre: "Afrobeat",
      mood: "Groovy",
      bpm: 108,
      musicalKey: "Fm",
      tags: JSON.stringify(["afrobeat", "groovy", "danceable", "fusion"]),
      description: "Afrobeat fusion with Indian percussion elements.",
      plays: 6200,
      coverArt: "/images/beat-cover.jpg",
      previewUrl: "/audio/preview-placeholder.mp3",
    },
  ];

  for (const bd of arjunBeats) {
    const beat = await prisma.beat.create({
      data: { ...bd, producerId: arjun.id, status: "PUBLISHED" },
    });
    await prisma.licensePlan.createMany({
      data: [
        { beatId: beat.id, type: "BASIC", price: 1499, includesMp3: true, streamingLimit: "500000", videoLimit: "1" },
        { beatId: beat.id, type: "PREMIUM", price: 3999, includesMp3: true, includesWav: true, streamingLimit: "UNLIMITED", videoLimit: "UNLIMITED" },
        { beatId: beat.id, type: "EXCLUSIVE", price: 35000, includesMp3: true, includesWav: true, includesStems: true, isExclusive: true, streamingLimit: "UNLIMITED", videoLimit: "UNLIMITED" },
      ],
    });
  }

  // Beats for Karan
  const karanBeats = [
    {
      title: "Voltage",
      slug: "voltage",
      genre: "EDM",
      mood: "Energetic",
      bpm: 128,
      musicalKey: "Am",
      tags: JSON.stringify(["edm", "energetic", "drop", "festival"]),
      description: "High-energy EDM beat with massive drops and synth leads.",
      plays: 5100,
      coverArt: "/images/beat-cover.jpg",
      previewUrl: "/audio/preview-placeholder.mp3",
    },
    {
      title: "Crystal",
      slug: "crystal",
      genre: "Pop",
      mood: "Upbeat",
      bpm: 115,
      musicalKey: "D",
      tags: JSON.stringify(["pop", "bright", "crystal", "clean"]),
      description: "Clean pop beat with shimmering synths and tight drums.",
      plays: 3800,
      coverArt: "/images/beat-cover.jpg",
      previewUrl: "/audio/preview-placeholder.mp3",
    },
    {
      title: "Phantom",
      slug: "phantom",
      genre: "Trap",
      mood: "Dark",
      bpm: 138,
      musicalKey: "Gm",
      tags: JSON.stringify(["trap", "dark", "phantom", "cinematic"]),
      description: "Cinematic trap beat with eerie textures and deep bass.",
      plays: 4200,
      coverArt: "/images/beat-cover.jpg",
      previewUrl: "/audio/preview-placeholder.mp3",
    },
  ];

  for (const bd of karanBeats) {
    const beat = await prisma.beat.create({
      data: { ...bd, producerId: karan.id, status: "PUBLISHED" },
    });
    await prisma.licensePlan.createMany({
      data: [
        { beatId: beat.id, type: "BASIC", price: 1299, includesMp3: true, streamingLimit: "500000", videoLimit: "1" },
        { beatId: beat.id, type: "PREMIUM", price: 3499, includesMp3: true, includesWav: true, streamingLimit: "UNLIMITED", videoLimit: "UNLIMITED" },
        { beatId: beat.id, type: "EXCLUSIVE", price: 30000, includesMp3: true, includesWav: true, includesStems: true, isExclusive: true, streamingLimit: "UNLIMITED", videoLimit: "UNLIMITED" },
      ],
    });
  }

  // Create follows
  await prisma.follow.createMany({
    data: [
      { followerId: artist1.id, followingId: rahul.id },
      { followerId: artist1.id, followingId: priya.id },
      { followerId: artist2.id, followingId: rahul.id },
      { followerId: artist2.id, followingId: arjun.id },
      { followerId: artist1.id, followingId: karan.id },
    ],
  });

  // Create some favorites
  const allBeats = await prisma.beat.findMany();
  if (allBeats.length >= 4) {
    await prisma.favorite.createMany({
      data: [
        { userId: artist1.id, beatId: allBeats[0].id },
        { userId: artist1.id, beatId: allBeats[2].id },
        { userId: artist2.id, beatId: allBeats[1].id },
        { userId: artist2.id, beatId: allBeats[4]?.id || allBeats[0].id },
      ],
    });
  }

  // Create a sample order
  const sampleBeat = allBeats[0];
  const samplePlan = await prisma.licensePlan.findFirst({
    where: { beatId: sampleBeat.id, type: "PREMIUM" },
  });

  if (samplePlan) {
    const commission = Math.min(samplePlan.price * 0.1, 5000);
    await prisma.order.create({
      data: {
        artistId: artist1.id,
        producerId: rahul.id,
        beatId: sampleBeat.id,
        licensePlanId: samplePlan.id,
        status: "COMPLETED",
        totalAmount: samplePlan.price,
        commission,
        producerAmount: samplePlan.price - commission,
        agreement: {
          create: {
            templateVersion: "v1.0",
            content: "Premium License Agreement — This agreement grants non-exclusive rights...",
            contentHash: "sha256-placeholder",
            artistLegalName: "Vikas R",
            producerLegalName: "Rahul Beats",
            acceptedAt: new Date(),
          },
        },
        payment: {
          create: {
            status: "COMPLETED",
            amount: samplePlan.price,
            method: "UPI",
            providerRef: "demo-pay-001",
          },
        },
        entitlement: {
          create: { active: true },
        },
      },
    });
  }

  // Create a conversation
  await prisma.conversation.create({
    data: {
      participant1Id: artist1.id,
      participant2Id: rahul.id,
      beatContextId: sampleBeat.id,
      messages: {
        create: [
          {
            senderId: artist1.id,
            receiverId: rahul.id,
            content: "Hey! Can the Premium license be used for Spotify monetization?",
            read: true,
          },
          {
            senderId: rahul.id,
            receiverId: artist1.id,
            content: "Yes! The Premium license allows unlimited streaming including Spotify monetization. Let me know if you have any other questions!",
            read: true,
          },
        ],
      },
    },
  });

  console.log("Seed complete.");
  console.log("\nDemo accounts (password: password123):");
  console.log("  Producer: rahul@example.com");
  console.log("  Producer: priya@example.com");
  console.log("  Producer: arjun@example.com");
  console.log("  Producer: karan@example.com");
  console.log("  Artist:   artist1@example.com");
  console.log("  Artist:   artist2@example.com");
  console.log("  Admin:    admin@beatmarket.in");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
