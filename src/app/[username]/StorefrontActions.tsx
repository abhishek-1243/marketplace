"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";

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
  const [error, setError] = useState("");

  const currentUserId = session?.user.id;
  const isOwnPage = currentUserId === producerId;

  const handleFollow = async () => {
    if (!session) {
      router.push("/login");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: producerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update follow status");
      setFollowing(data.following);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update follow status");
    } finally {
      setLoading(false);
    }
  };

  if (isOwnPage) {
    return (
      <button
        onClick={() => router.push("/dashboard/settings")}
        className="soundfuel-button-secondary"
      >
        Edit Profile
      </button>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={handleFollow}
        disabled={loading}
        aria-pressed={following}
        aria-busy={loading}
        className={following ? "soundfuel-button-secondary" : "soundfuel-button"}
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
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    </div>
  );
}
