"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserPlus, UserCheck, MessageSquare, Loader2 } from "lucide-react";

export default function StorefrontActions({
  producerId,
  producerUsername,
  isFollowing: initialFollowing,
}: {
  producerId: string;
  producerUsername: string;
  isFollowing: boolean;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);

  const currentUserId = (session?.user as any)?.id;
  const isOwnPage = currentUserId === producerId;

  const handleFollow = async () => {
    if (!session) {
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: producerId }),
      });
      const data = await res.json();
      setFollowing(data.following);
      router.refresh();
    } catch (err) {
      console.error("Follow error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!session) {
      router.push("/login");
      return;
    }
    setMsgLoading(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: producerId }),
      });
      const data = await res.json();
      router.push(`/messages?conv=${data.id}`);
    } catch (err) {
      console.error("Message error:", err);
    } finally {
      setMsgLoading(false);
    }
  };

  if (isOwnPage) {
    return (
      <button
        onClick={() => router.push("/dashboard/settings")}
        className="px-5 py-2 bg-white/[0.07] hover:bg-white/[0.12] rounded-full text-[13px] font-medium text-zinc-300 hover:text-white"
      >
        Edit Profile
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleFollow}
        disabled={loading}
        className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-[13px] font-semibold ${
          following
            ? "bg-white/[0.07] text-zinc-300 hover:bg-white/[0.12] hover:text-white"
            : "bg-white text-black hover:scale-[1.02] hover:bg-zinc-100"
        }`}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : following ? (
          <UserCheck className="w-3.5 h-3.5" />
        ) : (
          <UserPlus className="w-3.5 h-3.5" />
        )}
        {following ? "Following" : "Follow"}
      </button>
      <button
        onClick={handleMessage}
        disabled={msgLoading}
        className="flex items-center gap-1.5 px-5 py-2 bg-white/[0.07] hover:bg-white/[0.12] rounded-full text-[13px] font-medium text-zinc-300 hover:text-white"
      >
        {msgLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <MessageSquare className="w-3.5 h-3.5" />
        )}
        Message
      </button>
    </div>
  );
}
