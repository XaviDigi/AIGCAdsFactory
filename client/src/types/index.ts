export interface ScenePrompt {
  scene_id: number;
  image_prompt: {
    emotion: string;
    action: string;
    character: string;
    setting: string;
    camera: string;
    style: string;
  };
  video_prompt: {
    dialogue: string;
    emotion: string;
    voice_type: string;
    action: string;
    character: string;
    setting: string;
    camera: string;
  };
  aspect_ratio_image: string;
  aspect_ratio_video: string;
  model: string;
}

export interface GeneratedPrompts {
  scenes: ScenePrompt[];
}

export interface SceneProgress {
  sceneId: number;
  imageStatus: 'idle' | 'working' | 'done' | 'error';
  videoStatus: 'idle' | 'working' | 'done' | 'error';
  imageUrl?: string;
  videoUrl?: string;
  error?: string;
}

export interface ConfigFormData {
  referenceImageUrl: string;
  sceneCount: number;
  dialogue: string;
  model: 'veo3_fast' | 'veo3';
  imageAspectRatio: '2:3' | '3:2';
  videoAspectRatio: '9:16' | '16:9';
  specialRequests: string;
  productHint: string;
}

export interface KieImageResponse {
  successFlag: number;
  response: {
    taskId: string;
    resultUrls?: string[];
  };
}

export interface KieVideoResponse {
  successFlag: number;
  response: {
    taskId: string;
    resultUrls?: string[];
  };
}
