"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Music, ShieldCheck } from "lucide-react";
import { GENRES, MAX_ASSET_BYTES, MAX_PREVIEW_BYTES } from "@/lib/catalog-policy";

const MOODS = ["Dark", "Chill", "Energetic", "Smooth", "Aggressive", "Upbeat", "Emotional", "Groovy", "Relaxed"];
const KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "A#m", "Bm"];

type AssetType = "PREVIEW" | "MP3" | "WAV" | "STEMS" | "PACK";

export default function UploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [files, setFiles] = useState<Partial<Record<AssetType, File>>>({});
  const [form, setForm] = useState({
    kind: "BEAT",
    title: "",
    genre: "Trap",
    mood: "Dark",
    bpm: 140,
    musicalKey: "Cm",
    tags: "",
    description: "",
    region: "",
    instruments: "",
    sampleCount: 50,
    aiDisclosure: "NONE",
    rightsEvidence: "",
    sampleDisclosure: "NO_SAMPLES",
    rightsWarranty: false,
    basicPrice: 999,
    premiumPrice: 2999,
    exclusivePrice: 25000,
  });

  const uploadAsset = async (type: AssetType, file: File) => {
    if (file.size > (type === "PREVIEW" ? MAX_PREVIEW_BYTES : MAX_ASSET_BYTES)) throw new Error(`${type} exceeds the upload size limit`);
    const contentType = type === "PACK" || type === "STEMS" ? "application/zip" : type === "WAV" ? "audio/wav" : "audio/mpeg";
    const response = await fetch("/api/assets/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assetType: type, fileName: file.name, contentType, sizeBytes: file.size }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `Could not upload ${type}`);
    const upload = await fetch(data.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType, "x-amz-server-side-encryption": "AES256", "if-none-match": "*" },
      body: file,
    });
    if (!upload.ok) throw new Error(`${type} upload failed`);
    return { type, objectKey: data.objectKey };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!files.PREVIEW || (form.kind === "SOUND_PACK" ? !files.PACK : !files.MP3)) {
      setError(form.kind === "SOUND_PACK" ? "An MP3 demo and a complete sound-pack ZIP are required." : "A tagged preview MP3 and untagged MP3 master are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      setStatus("Uploading private audio…");
      const assets = await Promise.all(
        (Object.entries(files) as [AssetType, File][]).filter(([, file]) => Boolean(file)).map(([type, file]) => uploadAsset(type, file)),
      );
      let coverArt: string | undefined;
      if (cover) {
        setStatus("Uploading artwork…");
        const data = new FormData();
        data.append("file", cover);
        const result = await fetch("/api/upload", { method: "POST", body: data });
        const uploaded = await result.json();
        if (!result.ok) throw new Error(uploaded.error || "Artwork upload failed");
        coverArt = uploaded.url;
      }
      setStatus("Saving your listing…");
      const response = await fetch("/api/beats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
          coverArt,
          assets,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not publish beat");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setLoading(false);
      setStatus("");
    }
  };

  const inputClass = "soundfuel-input";
  const labelClass = "block text-[13px] font-medium text-secondary mb-1.5";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">Producer tools</p>
        <h1 className="text-2xl font-semibold tracking-tight mt-2">Share your sound</h1>
        <p className="text-sm text-muted mt-1">Original work can go live on your storefront after file validation. Marketplace discovery is selected separately. Purchases and downloads are disabled.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <label className="block text-sm">Listing type<select className={`${inputClass} mt-2`} value={form.kind} onChange={(event) => { setFiles({}); setForm({ ...form, kind: event.target.value, sampleDisclosure: "NO_SAMPLES" }); }}><option value="BEAT">Beat</option><option value="SOUND_PACK">Original sound pack</option></select></label>
        <div className="surface rounded-2xl p-5 space-y-4">
          <div>
            <label className={labelClass}>Title</label>
            <input aria-label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} required maxLength={120} />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div><label className={labelClass}>Genre</label><select aria-label="Genre" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} className={inputClass}>{GENRES.map((value) => <option key={value}>{value}</option>)}</select></div>
            <div><label className={labelClass}>Mood</label><select aria-label="Mood" value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })} className={inputClass}>{MOODS.map((value) => <option key={value}>{value}</option>)}</select></div>
            <div><label className={labelClass}>Key</label><select aria-label="Musical key" value={form.musicalKey} onChange={(e) => setForm({ ...form, musicalKey: e.target.value })} className={inputClass}>{KEYS.map((value) => <option key={value}>{value}</option>)}</select></div>
          </div>
          <div className="grid sm:grid-cols-[120px_1fr] gap-3">
            <div><label className={labelClass}>BPM</label><input aria-label="BPM" type="number" min={40} max={300} value={form.bpm} onChange={(e) => setForm({ ...form, bpm: Number(e.target.value) })} className={inputClass} /></div>
            <div><label className={labelClass}>Tags</label><input aria-label="Tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputClass} placeholder="dark, trap, 808" /></div>
          </div>
          <div><label className={labelClass}>Description</label><textarea aria-label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} min-h-24 resize-y`} required minLength={40} maxLength={2000} placeholder="Describe the recording, contents, musicians and intended use." /></div>
          <div className="grid sm:grid-cols-2 gap-3"><label className="text-sm">Regional influence<input required minLength={2} maxLength={80} value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="Punjab, South India, contemporary fusion…" className={`${inputClass} mt-2`} /></label><label className="text-sm">Instruments / textures<input required minLength={2} maxLength={160} value={form.instruments} onChange={(e) => setForm({ ...form, instruments: e.target.value })} placeholder="Dhol, bansuri, tabla, synth…" className={`${inputClass} mt-2`} /></label></div>
          {form.kind === "SOUND_PACK" && <label className="block text-sm">Number of sounds<input type="number" min={1} max={100000} required value={form.sampleCount} onChange={(e) => setForm({ ...form, sampleCount: Number(e.target.value) })} className={`${inputClass} mt-2`} /></label>}
          <div><label className={labelClass}>Cover artwork</label><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setCover(e.target.files?.[0] || null)} className={inputClass} /></div>
        </div>

        <div className="surface rounded-2xl p-5">
          <h2 className="font-semibold mb-1">Audio files</h2>
          <p className="text-xs text-muted mb-4">MP3 previews: up to 20 MB. Other files: up to 500 MB each. Only the listening preview is public; production files stay private.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {(form.kind === "SOUND_PACK" ? [
              ["PREVIEW", "Pack demo MP3", "audio/mpeg", true],
              ["PACK", "Original recordings ZIP", "application/zip", true],
            ] as const : [
              ["PREVIEW", "Tagged preview MP3", "audio/mpeg", true],
              ["MP3", "Untagged MP3 master", "audio/mpeg", true],
              ["WAV", "WAV master", "audio/wav,audio/x-wav", false],
              ["STEMS", "Stems ZIP", "application/zip", false],
            ] as const).map(([type, label, accept, required]) => (
              <label key={`${form.kind}-${type}`} className="block p-4 rounded-xl bg-black/20 border border-white/[0.06]">
                <span className="text-sm font-medium">{label}{required && <span className="text-accent-400"> *</span>}</span>
                <input type="file" accept={accept} required={required} onChange={(e) => setFiles({ ...files, [type]: e.target.files?.[0] })} className="block w-full mt-2 text-xs text-muted" />
              </label>
            ))}
          </div>
        </div>

        <div className="surface rounded-2xl p-5">
          <h2 className="font-semibold mb-4">Indicative pricing · INR</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {(form.kind === "SOUND_PACK" ? [["basicPrice", "Sound pack"]] as const : [
              ["basicPrice", "Basic · MP3"],
              ["premiumPrice", "Premium · WAV"],
              ["exclusivePrice", "Exclusive · Stems"],
            ] as const).map(([field, label]) => (
              <div key={field}><label className={labelClass}>{label}</label><input type="number" min={499} required value={form[field]} onChange={(e) => setForm({ ...form, [field]: Number(e.target.value) })} className={inputClass} /></div>
            ))}
          </div>
          <p className="text-xs text-muted mt-3">Prices are shown for preview only. No licence is sold or accepted. Final contracts, commission and taxes will be confirmed before commerce launches.</p>
        </div>

        <div className="surface rounded-2xl p-5 space-y-4">
          <div>
            <label className={labelClass}>Third-party samples</label>
            <select value={form.sampleDisclosure} onChange={(e) => setForm({ ...form, sampleDisclosure: e.target.value })} className={inputClass}>
              <option value="NO_SAMPLES">No third-party samples</option>
              {form.kind === "BEAT" && <><option value="ROYALTY_FREE_OR_LICENSED">Royalty-free or licensed samples</option><option value="INDIVIDUALLY_CLEARED">Individually cleared samples</option></>}
            </select>
          </div>
          <label className="block text-sm">AI usage<select value={form.aiDisclosure} onChange={(e) => setForm({ ...form, aiDisclosure: e.target.value })} className={`${inputClass} mt-2`}><option value="NONE">No generative AI</option><option value="ASSISTED">AI-assisted tools (mixing, cleanup or sound design)</option></select></label>
          <label className="block text-sm">Sources, collaborators and permissions<textarea value={form.rightsEvidence} onChange={(e) => setForm({ ...form, rightsEvidence: e.target.value })} required={form.sampleDisclosure !== "NO_SAMPLES"} minLength={form.sampleDisclosure !== "NO_SAMPLES" ? 20 : undefined} maxLength={3000} placeholder="Private to the review team. Name sample sources, collaborators, licence permissions and available proof. Never include passwords or payment details." className={`${inputClass} mt-2 min-h-24`} /></label>
          <p className="text-xs text-muted">Substantially generated audio is not accepted. Sound packs must contain original recordings you may redistribute. Third-party samples in beats require a rights review before publication.</p>
          <label className="flex gap-3 text-sm text-secondary">
            <input aria-label="Rights declaration" type="checkbox" checked={form.rightsWarranty} onChange={(e) => setForm({ ...form, rightsWarranty: e.target.checked })} className="mt-0.5 accent-accent-400" required />
            <span>I control the composition, master, performance, sample and artwork rights needed for this listing. My declarations and collaborator permissions are accurate.</span>
          </label>
          <div className="flex items-center gap-2 text-xs text-muted"><ShieldCheck className="w-4 h-4 text-accent-400" /> This declaration is stored with the beat version.</div>
        </div>

        {error && <p className="text-sm text-red-300 bg-red-500/10 px-4 py-3 rounded-xl">{error}</p>}
        <button type="submit" disabled={loading} aria-busy={loading} className="soundfuel-button w-full">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> {status}</> : <><Music className="w-4 h-4" /> Save to catalog</>}
        </button>
      </form>
    </div>
  );
}
