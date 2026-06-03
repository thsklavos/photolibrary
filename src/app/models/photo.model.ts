export interface Photo {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;           // original source (unsplash link)
  download_url: string;  // full res
  display_url: string;   // sized for grid
}

export type SortOption = 'newest' | 'oldest' | 'author-asc' | 'author-desc';

export interface PhotoFilter {
  search: string;
  sort: SortOption;
}
