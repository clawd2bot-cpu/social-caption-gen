export type Platform = "instagram" | "tiktok" | "pinterest" | "twitter";

export interface GenerateRequest {
  title: string;
  description: string;
  audience: string;
}

export interface PlatformResult {
  platform: Platform;
  content: string;
  error?: string;
}

export interface StreamChunk {
  platform: Platform;
  content?: string;
  error?: string;
  done?: boolean;
}
