export type Track = {
  id: number;
  title: string;
  artist: string;
  genre: string;
  mp3: string | null;
  cover: string | null;
  color: string;
  durationSeconds?: number;
  isCustom?: boolean;
};

export type NewTrackInput = {
  title?: string;
  artist?: string;
  genre?: string;
  mp3?: string | null;
  cover?: string | null;
  mp3File?: File;
  coverFile?: File;
  durationSeconds?: number;
  color?: string;
  isCustom?: boolean;
};

export type UserPlaylist = {
  id: string;
  name: string;
  trackIds: number[];
  createdAt: number;
};
