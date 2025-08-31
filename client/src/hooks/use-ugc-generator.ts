import { useState, useCallback, useEffect } from "react";
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
  dialogues: string[];
  model: string;
  imageModel: string;
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
  creditBalance: number | null;
}

// Global store state
let globalStore: UGCStore = {
  scenes: [],
  prompts: null,
  sceneCount: 1,
  isGenerating: false,
  creditBalance: null
};

const listeners = new Set<() => void>();

function updateStore(updates: Partial<UGCStore>) {
  globalStore = { ...globalStore, ...updates };
  listeners.forEach(listener => listener());
}

export function useUGCStore() {
  const [, forceUpdate] = useState({});
  
  const rerender = useCallback(() => forceUpdate({}), []);
  
  useEffect(() => {
    listeners.add(rerender);
    return () => {
      listeners.delete(rerender);
    };
  }, [rerender]);

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
        dialogues: props.dialogues,
        model: props.model,
        imageModel: props.imageModel,
        imageAspectRatio: props.imageAspectRatio,
        videoAspectRatio: props.videoAspectRatio,
        specialRequests: props.specialRequests,
        productHint: props.productHint
      });

      console.log('Generated prompts:', prompts);
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
        try {
          await processScene(i, prompts.scenes[i], kieAPI, props.referenceImage, props.imageModel);
        } catch (error) {
          console.error(`Failed to process scene ${i + 1}:`, error);
          // Continue with other scenes even if one fails
        }
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
        dialogues: props.dialogues,
        model: props.model,
        imageModel: props.imageModel,
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

  const fetchCreditBalance = useCallback(async () => {
    try {
      const balance = await kieAPI.getCreditBalance();
      updateStore({ creditBalance: balance });
      return balance;
    } catch (error) {
      console.error('Failed to fetch credit balance:', error);
      return null;
    }
  }, [kieAPI]);

  return {
    generateScenes,
    copyPromptsJSON,
    fetchCreditBalance,
    isGenerating: globalStore.isGenerating,
    creditBalance: globalStore.creditBalance
  };
}

async function processScene(
  sceneIndex: number,
  scenePrompt: any,
  kieAPI: KieAPI,
  referenceImage: string,
  imageModel: string
) {
  const sceneId = sceneIndex + 1;

  try {
    console.log(`Processing scene ${sceneId}:`, scenePrompt);
    
    // Update scene status to working for image
    updateSceneStatus(sceneIndex, 'imageStatus', 'working');

    const imagePromptString = buildImagePromptString(scenePrompt.image_prompt);
    console.log(`Image prompt for scene ${sceneId}:`, imagePromptString);

    // Generate image
    const imageUrl = await kieAPI.generateImage({
      prompt: imagePromptString,
      filesUrl: [referenceImage],
      size: scenePrompt.aspect_ratio_image
    }, imageModel);

    console.log(`Image generated for scene ${sceneId}:`, imageUrl);

    updateSceneStatus(sceneIndex, 'imageStatus', 'done');
    updateSceneData(sceneIndex, 'imageUrl', imageUrl);

    // Update scene status to working for video
    updateSceneStatus(sceneIndex, 'videoStatus', 'working');

    const videoPromptString = buildVideoPromptString(scenePrompt.video_prompt);
    console.log(`Video prompt for scene ${sceneId}:`, videoPromptString);

    // Generate video
    const videoUrl = await kieAPI.generateVideo({
      prompt: videoPromptString,
      model: scenePrompt.model,
      aspectRatio: scenePrompt.aspect_ratio_video,
      imageUrls: imageUrl
    });

    console.log(`Video generated for scene ${sceneId}:`, videoUrl);

    updateSceneStatus(sceneIndex, 'videoStatus', 'done');
    updateSceneData(sceneIndex, 'videoUrl', videoUrl);

  } catch (error) {
    console.error(`Scene ${sceneId} processing failed:`, error);
    const currentScene = globalStore.scenes[sceneIndex];
    
    // Only set image to error if it was working, otherwise it might be a video error
    if (currentScene?.imageStatus === 'working') {
      updateSceneStatus(sceneIndex, 'imageStatus', 'error');
    } else if (currentScene?.videoStatus === 'working') {
      updateSceneStatus(sceneIndex, 'videoStatus', 'error');
    } else {
      // If we don't know which step failed, set both to error
      updateSceneStatus(sceneIndex, 'imageStatus', 'error');
      updateSceneStatus(sceneIndex, 'videoStatus', 'error');
    }
    // Don't re-throw the error to continue with other scenes
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
