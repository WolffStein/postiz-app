export interface PostDetails {
  id: string;
  message?: string;
  media?: Array<{
    url: string;
    path?: string;
  }>;
  settings?: Record<string, any>;
}

export interface PostResponse {
  id: string;
  postId: string;
  releaseURL?: string;
  status: string;
} 