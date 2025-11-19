export enum AppMode {
  PREMIUM = 'PREMIUM',
  TRY_ON = 'TRY_ON',
  RECOLOR = 'RECOLOR',
  VIDEO_SCRIPT = 'VIDEO_SCRIPT'
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

export interface LoadingState {
  isLoading: boolean;
  message: string;
}
