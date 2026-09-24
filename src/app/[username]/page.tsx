import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatNumber } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import StorefrontBeats from "./StorefrontBeats";
import StorefrontActions from "./StorefrontActions";

export default async function ProducerStorefront({
  params,
}: {
  params: { username: string };
}) {
  const producer = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      beats: {
        where: { status: "PUBLISHED" },
        include: {
          licensePlans: { where: { active: true }, select: { price: true, type: true } },
        },
        orderBy: { plays: "desc" },
      },
      _count: { select: { followers: true } },
    },
  });

  if (!producer || producer.role !== "PRODUCER") return notFound();

  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as any)?.id;

  let isFollowing = false;
  if (currentUserId) {
    const follow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: currentUserId, followingId: producer.id } },
    });
    isFollowing = !!follow;
  }

  const genres: string[] = producer.genres ? JSON.parse(producer.genres) : [];

  return (
    <div className="min-h-screen">
      <div className="relative h-48 sm:h-64 bg-gradient-to-b from-zinc-800 to-black overflow-hidden">
        {producer.banner && (
          <img
            src={producer.banner}
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 -mt-16 relative z-10">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-[180px] h-[180px] rounded-xl bg-zinc-800 overflow-hidden shadow-2xl shrink-0">
            {producer.profileImage ? (
              <img
                src={producer.profileImage}
                alt={producer.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-zinc-500">
                {producer.displayName[0]}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pt-4">
            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-widest">Producer</p>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mt-1">{producer.displayName}</h1>
            {genres.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                {genres.map((g: string) => (
                  <span key={g} className="px-2.5 py-0.5 bg-white/[0.06] rounded text-[12px] text-zinc-400">{g}</span>
                ))}
              </div>
            )}
            {producer.bio && (
              <p className="mt-3 text-[13px] text-zinc-400 max-w-lg leading-relaxed">{producer.bio}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-[13px] text-zinc-500">
              <span>{formatNumber(producer._count.followers)} followers</span>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <span>{producer.beats.length} beats</span>
            </div>

            <div className="mt-4">
              <StorefrontActions
                producerId={producer.id}
                producerUsername={producer.username}
                isFollowing={isFollowing}
              />
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-base font-semibold mb-4">Beats</h2>
          <StorefrontBeats
            beats={producer.beats.map((b: any) => ({
              ...b,
              producer: {
                displayName: producer.displayName,
                username: producer.username,
              },
            }))}
          />
        </div>

        {(producer.instagram || producer.youtube || producer.spotify) && (
          <div className="mt-10 pb-8">
            <h2 className="text-base font-semibold mb-3">Links</h2>
            <div className="flex flex-wrap gap-2">
              {producer.instagram && (
                <a
                  href={`https://instagram.com/${producer.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] rounded-full text-[13px] text-zinc-400 hover:text-white"
                >
                  Instagram
                </a>
              )}
              {producer.youtube && (
                <a
                  href={`https://youtube.com/@${producer.youtube}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] rounded-full text-[13px] text-zinc-400 hover:text-white"
                >
                  YouTube
                </a>
              )}
              {producer.spotify && (
                <a
                  href={`https://open.spotify.com/artist/${producer.spotify}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] rounded-full text-[13px] text-zinc-400 hover:text-white"
                >
                  Spotify
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
