"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, Music } from "lucide-react";

const GENRES = ["Trap", "Hip-Hop", "R&B", "Pop", "Afrobeat", "Drill", "Lo-fi", "Bollywood", "Experimental"];
const MOODS = ["Dark", "Chill", "Energetic", "Smooth", "Aggressive", "Upbeat", "Emotional", "Groovy", "Relaxed"];
const KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "A#m", "Bm"];

export default function UploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    genre: "Trap",
    mood: "Dark",
    bpm: 140,
    musicalKey: "Cm",
    tags: "",
    description: "",
    basicPrice: 999,
    premiumPrice: 2999,
    exclusivePrice: 25000,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/beats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-white/[0.07] hover:bg-white/[0.1] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-white/30 border-0";
  const labelClass = "block text-[13px] font-medium text-zinc-400 mb-1.5";

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-xl font-bold tracking-tight mb-6">Upload Beat</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelClass}>Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass}
            placeholder="Beat title"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Genre</label>
            <select
              value={form.genre}
              onChange={(e) => setForm({ ...form, genre: e.target.value })}
              className={inputClass}
            >
              {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Mood</label>
            <select
              value={form.mood}
              onChange={(e) => setForm({ ...form, mood: e.target.value })}
              className={inputClass}
            >
              {MOODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>BPM</label>
            <input
              type="number"
              value={form.bpm}
              onChange={(e) => setForm({ ...form, bpm: parseInt(e.target.value) || 0 })}
              className={inputClass}
              min={40}
              max={300}
            />
          </div>
          <div>
            <label className={labelClass}>Key</label>
            <select
              value={form.musicalKey}
              onChange={(e) => setForm({ ...form, musicalKey: e.target.value })}
              className={inputClass}
            >
              {KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Tags (comma separated)</label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className={inputClass}
            placeholder="dark, trap, 808, hard"
          />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={`${inputClass} min-h-[80px] resize-none`}
            placeholder="Describe your beat..."
          />
        </div>

        <div className="p-4 bg-zinc-900 rounded-lg">
          <p className="text-[13px] font-medium mb-1">Audio Files</p>
          <p className="text-[11px] text-zinc-600 mb-3">File upload requires cloud storage integration. Demo uses placeholder audio.</p>
          <div className="flex items-center gap-3 p-4 border border-dashed border-white/[0.1] rounded-lg">
            <Upload className="w-4 h-4 text-zinc-600" />
            <span className="text-[13px] text-zinc-500">Audio upload coming soon</span>
          </div>
        </div>

        <div>
          <label className={labelClass}>License Pricing</label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-zinc-600 mb-1">Basic (MP3)</label>
              <input
                type="number"
                value={form.basicPrice}
                onChange={(e) => setForm({ ...form, basicPrice: parseInt(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-600 mb-1">Premium (WAV)</label>
              <input
                type="number"
                value={form.premiumPrice}
                onChange={(e) => setForm({ ...form, premiumPrice: parseInt(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-600 mb-1">Exclusive (Stems)</label>
              <input
                type="number"
                value={form.exclusivePrice}
                onChange={(e) => setForm({ ...form, exclusivePrice: parseInt(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-white text-black rounded-full text-sm font-semibold hover:scale-[1.01] hover:bg-zinc-100 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Music className="w-4 h-4" />}
          Publish Beat
        </button>
      </form>
    </div>
  );
}
