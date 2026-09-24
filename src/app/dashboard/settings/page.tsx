import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      displayName: true,
      username: true,
      email: true,
      bio: true,
      genres: true,
      profileImage: true,
      banner: true,
      instagram: true,
      youtube: true,
      spotify: true,
      otherLinks: true,
      legalName: true,
      phone: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-xl font-bold tracking-tight mb-1">Profile Settings</h1>
      <p className="text-[13px] text-zinc-500 mb-8">Customize your storefront</p>
      <SettingsForm user={user} />
    </div>
  );
}
