export interface UGCScene {
  id: number;
  imageStatus: 'idle' | 'working' | 'done' | 'error';
  videoStatus: 'idle' | 'working' | 'done' | 'error';
  imageUrl: string | null;
  videoUrl: string | null;
}

export interface ImagePrompt {
  emotion: string;
  action: string;
  character: string;
  setting: string;
  camera: string;
  style: string;
}

export interface VideoPrompt {
  dialogue: string;
  emotion: string;
  voice_type: string;
  action: string;
  character: string;
  setting: string;
  camera: string;
}

export interface ScenePrompt {
  scene_id: number;
  image_prompt: ImagePrompt;
  video_prompt: VideoPrompt;
  aspect_ratio_image: string;
  aspect_ratio_video: string;
  model: string;
}

export interface UGCPrompts {
  scenes: ScenePrompt[];
}

export interface GenerationConfig {
  referenceImage: string;
  sceneCount: number;
  dialogue: string;
  model: 'veo3_fast' | 'veo3';
  imageAspectRatio: '2:3' | '3:2';
  videoAspectRatio: '9:16' | '16:9';
  specialRequests: string;
  productHint: string;
}
