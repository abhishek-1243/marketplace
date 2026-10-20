import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) {
    console.log("No ADMIN_EMAIL supplied; nothing to seed.");
    return;
  }

  const base = (process.env.ADMIN_USERNAME || email.split("@")[0])
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 24) || "soundfuel-admin";
  const usernameOwner = await prisma.user.findUnique({ where: { username: base } });
  const username = usernameOwner?.email === email ? base : `${base}-${Date.now().toString().slice(-5)}`;

  await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", verified: true },
    create: {
      email,
      username,
      displayName: process.env.ADMIN_DISPLAY_NAME || "Soundfuel Admin",
      role: "ADMIN",
      verified: true,
      onboardingComplete: true,
    },
  });
  console.log(`Admin access configured for ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
