
export interface MovieResult {
  id: string;
  timestamp: number;
  title: string;
  year?: string;
  genre?: string;
  description: string;
  confidence: number;
  sources: Array<{ title: string; uri: string }>;
  isFound: boolean;
  imageThumbnail?: string | null;
}

export interface SearchState {
  loading: boolean;
  error: string | null;
  result: MovieResult | null;
}