import { useState, useCallback } from "react";
import { buildPrompts } from "@/lib/prompt-builder";
import { KieAPI } from "@/lib/kie-api";
import { useToast } from "@/hooks/use-toast";
import type { UGCScene, UGCPrompts } from "@/types/ugc";

interface UseUGCGeneratorProps {
  apiKey: string;
  mockMode: boolean;
  sceneCount: number;
  referenceImage: string;
  dialogue: string;
  model: string;
  imageAspectRatio: string;
  videoAspectRatio: string;
  specialRequests: string;
  productHint: string;
}

interface UGCStore {
  scenes: UGCScene[];
  prompts: UGCPrompts | null;
  sceneCount: number;
  isGenerating: boolean;
}

// Global store state
let globalStore: UGCStore = {
  scenes: [],
  prompts: null,
  sceneCount: 3,
  isGenerating: false
};

const listeners = new Set<() => void>();

function updateStore(updates: Partial<UGCStore>) {
  globalStore = { ...globalStore, ...updates };
  listeners.forEach(listener => listener());
}

export function useUGCStore() {
  const [, forceUpdate] = useState({});
  
  const rerender = useCallback(() => forceUpdate({}), []);
  
  useState(() => {
    listeners.add(rerender);
    return () => listeners.delete(rerender);
  });

  return globalStore;
}

export function useUGCGenerator(props: UseUGCGeneratorProps) {
  const { toast } = useToast();
  const kieAPI = new KieAPI(props.apiKey, props.mockMode);

  const generateScenes = useCallback(async () => {
    if (globalStore.isGenerating) return;

    try {
      updateStore({ isGenerating: true, sceneCount: props.sceneCount });

      // Build prompts
      const prompts = buildPrompts({
        sceneCount: props.sceneCount,
        dialogue: props.dialogue,
        model: props.model,
        imageAspectRatio: props.imageAspectRatio,
        videoAspectRatio: props.videoAspectRatio,
        specialRequests: props.specialRequests,
        productHint: props.productHint
      });

      updateStore({ prompts });

      // Initialize scenes
      const initialScenes: UGCScene[] = [];
      for (let i = 1; i <= props.sceneCount; i++) {
        initialScenes.push({
          id: i,
          imageStatus: 'idle',
          videoStatus: 'idle',
          imageUrl: null,
          videoUrl: null
        });
      }
      updateStore({ scenes: initialScenes });

      // Process each scene
      for (let i = 0; i < props.sceneCount; i++) {
        await processScene(i, prompts.scenes[i], kieAPI, props.referenceImage);
      }

      toast({
        title: "Generation Complete",
        description: "All scenes have been processed successfully!"
      });

    } catch (error) {
      console.error('Generation failed:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      updateStore({ isGenerating: false });
    }
  }, [props, kieAPI, toast]);

  const copyPromptsJSON = useCallback(async () => {
    try {
      const prompts = buildPrompts({
        sceneCount: props.sceneCount,
        dialogue: props.dialogue,
        model: props.model,
        imageAspectRatio: props.imageAspectRatio,
        videoAspectRatio: props.videoAspectRatio,
        specialRequests: props.specialRequests,
        productHint: props.productHint
      });

      await navigator.clipboard.writeText(JSON.stringify(prompts, null, 2));
      
      toast({
        title: "Copied to Clipboard",
        description: "Prompts JSON has been copied to your clipboard"
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  }, [props, toast]);

  return {
    generateScenes,
    copyPromptsJSON,
    isGenerating: globalStore.isGenerating
  };
}

async function processScene(
  sceneIndex: number,
  scenePrompt: any,
  kieAPI: KieAPI,
  referenceImage: string
) {
  const sceneId = sceneIndex + 1;

  try {
    // Update scene status to working for image
    updateSceneStatus(sceneIndex, 'imageStatus', 'working');

    // Generate image
    const imageUrl = await kieAPI.generateImage({
      prompt: buildImagePromptString(scenePrompt.image_prompt),
      filesUrl: [referenceImage],
      size: scenePrompt.aspect_ratio_image
    });

    updateSceneStatus(sceneIndex, 'imageStatus', 'done');
    updateSceneData(sceneIndex, 'imageUrl', imageUrl);

    // Update scene status to working for video
    updateSceneStatus(sceneIndex, 'videoStatus', 'working');

    // Generate video
    const videoUrl = await kieAPI.generateVideo({
      prompt: buildVideoPromptString(scenePrompt.video_prompt),
      model: scenePrompt.model,
      aspectRatio: scenePrompt.aspect_ratio_video,
      imageUrls: imageUrl
    });

    updateSceneStatus(sceneIndex, 'videoStatus', 'done');
    updateSceneData(sceneIndex, 'videoUrl', videoUrl);

  } catch (error) {
    console.error(`Scene ${sceneId} processing failed:`, error);
    updateSceneStatus(sceneIndex, 'imageStatus', 'error');
    updateSceneStatus(sceneIndex, 'videoStatus', 'error');
    throw error;
  }
}

function updateSceneStatus(sceneIndex: number, statusField: 'imageStatus' | 'videoStatus', status: string) {
  const scenes = [...globalStore.scenes];
  if (scenes[sceneIndex]) {
    scenes[sceneIndex] = { ...scenes[sceneIndex], [statusField]: status };
    updateStore({ scenes });
  }
}

function updateSceneData(sceneIndex: number, field: 'imageUrl' | 'videoUrl', value: string) {
  const scenes = [...globalStore.scenes];
  if (scenes[sceneIndex]) {
    scenes[sceneIndex] = { ...scenes[sceneIndex], [field]: value };
    updateStore({ scenes });
  }
}

function buildImagePromptString(imagePrompt: any): string {
  return `${imagePrompt.emotion}, ${imagePrompt.action}, ${imagePrompt.character}, ${imagePrompt.setting}, ${imagePrompt.camera}, ${imagePrompt.style}`;
}

function buildVideoPromptString(videoPrompt: any): string {
  return `${videoPrompt.dialogue} - ${videoPrompt.emotion}, ${videoPrompt.voice_type}, ${videoPrompt.action}, ${videoPrompt.character}, ${videoPrompt.setting}, ${videoPrompt.camera}`;
}
