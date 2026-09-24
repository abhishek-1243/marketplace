"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Camera, Save, Loader2, Check, Upload, X, ImageIcon } from "lucide-react";

const GENRE_OPTIONS = ["Trap", "Hip-Hop", "R&B", "Pop", "Afrobeat", "Drill", "Lo-fi", "Bollywood", "EDM", "Reggaeton"];

interface UserData {
  id: string;
  displayName: string;
  username: string;
  email: string;
  bio: string | null;
  genres: string | null;
  profileImage: string | null;
  banner: string | null;
  instagram: string | null;
  youtube: string | null;
  spotify: string | null;
  otherLinks: string | null;
  legalName: string | null;
  phone: string | null;
}

export default function SettingsForm({ user }: { user: UserData }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [dragOverProfile, setDragOverProfile] = useState(false);
  const [dragOverBanner, setDragOverBanner] = useState(false);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const parsedGenres: string[] = user.genres ? JSON.parse(user.genres) : [];

  const [form, setForm] = useState({
    displayName: user.displayName,
    bio: user.bio || "",
    genres: parsedGenres,
    profileImage: user.profileImage || "",
    banner: user.banner || "",
    instagram: user.instagram || "",
    youtube: user.youtube || "",
    spotify: user.spotify || "",
    otherLinks: user.otherLinks || "",
    legalName: user.legalName || "",
    phone: user.phone || "",
  });

  const toggleGenre = (genre: string) => {
    setForm((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const uploadFile = useCallback(async (file: File, field: "profileImage" | "banner") => {
    const setUploading = field === "profileImage" ? setUploadingProfile : setUploadingBanner;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG, PNG, WebP, GIF)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Max 5MB");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Upload failed");
        return;
      }

      const { url } = await res.json();
      setForm((prev) => ({ ...prev, [field]: url }));
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, field: "profileImage" | "banner") => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file, field);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent, field: "profileImage" | "banner") => {
    e.preventDefault();
    if (field === "profileImage") setDragOverProfile(false);
    else setDragOverBanner(false);

    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file, field);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          genres: JSON.stringify(form.genres),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
        return;
      }

      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-white/[0.07] hover:bg-white/[0.1] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-white/30 border-0";
  const labelClass = "block text-[13px] font-medium text-zinc-400 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-base font-semibold">Appearance</h2>

        <input
          ref={profileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => handleFileSelect(e, "profileImage")}
        />
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => handleFileSelect(e, "banner")}
        />

        <div className="flex items-start gap-5">
          <div>
            <div
              className={`relative group w-20 h-20 rounded-xl overflow-hidden cursor-pointer transition-all ${
                dragOverProfile ? "ring-2 ring-white/40 scale-105" : ""
              } ${form.profileImage ? "" : "bg-zinc-800"}`}
              onClick={() => profileInputRef.current?.click()}
              onDrop={(e) => handleDrop(e, "profileImage")}
              onDragOver={handleDragOver}
              onDragEnter={() => setDragOverProfile(true)}
              onDragLeave={() => setDragOverProfile(false)}
            >
              {form.profileImage ? (
                <img src={form.profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-zinc-500">
                  {form.displayName[0]}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingProfile ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <p className="text-[11px] text-zinc-600 text-center flex-1">Profile</p>
              {form.profileImage && (
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, profileImage: "" }))}
                  className="text-zinc-600 hover:text-zinc-400"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1">
            <div
              className={`relative group h-20 rounded-xl overflow-hidden cursor-pointer transition-all ${
                dragOverBanner ? "ring-2 ring-white/40 scale-[1.01]" : ""
              } ${form.banner ? "" : "bg-zinc-800"}`}
              onClick={() => bannerInputRef.current?.click()}
              onDrop={(e) => handleDrop(e, "banner")}
              onDragOver={handleDragOver}
              onDragEnter={() => setDragOverBanner(true)}
              onDragLeave={() => setDragOverBanner(false)}
            >
              {form.banner ? (
                <img src={form.banner} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                  <ImageIcon className="w-4 h-4 text-zinc-600" />
                  <p className="text-[11px] text-zinc-600">Click or drag to upload</p>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingBanner ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <p className="text-[11px] text-zinc-600 flex-1">Banner</p>
              {form.banner && (
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, banner: "" }))}
                  className="text-zinc-600 hover:text-zinc-400"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="text-[11px] text-zinc-600">JPG, PNG, WebP or GIF. Max 5MB. Click, drag and drop, or paste.</p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold">Basic Info</h2>

        <div>
          <label className={labelClass}>Display Name</label>
          <input
            type="text"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Username</label>
          <input
            type="text"
            value={user.username}
            disabled
            className="w-full px-4 py-2.5 bg-white/[0.04] rounded-md text-sm text-zinc-600 cursor-not-allowed border-0"
          />
          <p className="text-[11px] text-zinc-600 mt-1">Cannot be changed</p>
        </div>

        <div>
          <label className={labelClass}>Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            maxLength={300}
            className={`${inputClass} resize-none`}
            placeholder="Tell artists about your style..."
          />
          <p className="text-[11px] text-zinc-600 mt-1">{form.bio.length}/300</p>
        </div>

        <div>
          <label className={labelClass}>Genres</label>
          <div className="flex flex-wrap gap-1.5">
            {GENRE_OPTIONS.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => toggleGenre(genre)}
                className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                  form.genres.includes(genre)
                    ? "bg-white text-black"
                    : "bg-white/[0.06] text-zinc-400 hover:bg-white/[0.1] hover:text-white"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold">Social Links</h2>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Instagram</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">@</span>
              <input
                type="text"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                className={`${inputClass} pl-8`}
                placeholder="username"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>YouTube</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">@</span>
              <input
                type="text"
                value={form.youtube}
                onChange={(e) => setForm({ ...form, youtube: e.target.value })}
                className={`${inputClass} pl-8`}
                placeholder="channel"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Spotify Artist ID</label>
            <input
              type="text"
              value={form.spotify}
              onChange={(e) => setForm({ ...form, spotify: e.target.value })}
              className={inputClass}
              placeholder="artist ID"
            />
          </div>
          <div>
            <label className={labelClass}>Other Links</label>
            <input
              type="text"
              value={form.otherLinks}
              onChange={(e) => setForm({ ...form, otherLinks: e.target.value })}
              className={inputClass}
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold">Legal</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Legal Name</label>
            <input
              type="text"
              value={form.legalName}
              onChange={(e) => setForm({ ...form, legalName: e.target.value })}
              className={inputClass}
              placeholder="Used in license agreements"
            />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputClass}
              placeholder="+91..."
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-[13px] text-red-400 bg-red-500/10 px-4 py-2 rounded-lg">{error}</p>
      )}

      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-full text-[13px] font-semibold hover:scale-[1.02] hover:bg-zinc-100 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : saved ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          {saving ? "Saving..." : saved ? "Saved" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/${user.username}`)}
          className="px-6 py-2.5 bg-white/[0.07] hover:bg-white/[0.12] rounded-full text-[13px] font-medium text-zinc-300 hover:text-white"
        >
          View Storefront
        </button>
      </div>
    </form>
  );
}
