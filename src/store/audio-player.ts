import { create } from "zustand";

export interface Track {
  id: string;
  title: string;
  producer: string;
  producerUsername: string;
  coverArt: string;
  previewUrl: string;
  price: number;
  beatId: string;
}

interface AudioPlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  queue: Track[];
  queueIndex: number;

  setTrack: (track: Track) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  next: () => void;
  previous: () => void;
  setQueue: (tracks: Track[], startIndex?: number) => void;
}

export const useAudioPlayer = create<AudioPlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  progress: 0,
  duration: 0,
  volume: 0.8,
  queue: [],
  queueIndex: 0,

  setTrack: (track) =>
    set({ currentTrack: track, isPlaying: true, progress: 0, duration: 0 }),

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),

  next: () => {
    const { queue, queueIndex } = get();
    if (queueIndex < queue.length - 1) {
      const nextIndex = queueIndex + 1;
      set({
        currentTrack: queue[nextIndex],
        queueIndex: nextIndex,
        isPlaying: true,
        progress: 0,
      });
    }
  },

  previous: () => {
    const { queue, queueIndex } = get();
    if (queueIndex > 0) {
      const prevIndex = queueIndex - 1;
      set({
        currentTrack: queue[prevIndex],
        queueIndex: prevIndex,
        isPlaying: true,
        progress: 0,
      });
    }
  },

  setQueue: (tracks, startIndex = 0) =>
    set({
      queue: tracks,
      queueIndex: startIndex,
      currentTrack: tracks[startIndex],
      isPlaying: true,
      progress: 0,
    }),
}));
