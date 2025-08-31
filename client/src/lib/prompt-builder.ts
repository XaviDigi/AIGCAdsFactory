import type { UGCPrompts } from "@/types/ugc";

interface PromptBuilderOptions {
  sceneCount: number;
  dialogue: string;
  dialogues: string[];
  model: string;
  imageAspectRatio: string;
  videoAspectRatio: string;
  specialRequests: string;
  productHint: string;
}

export function buildPrompts(options: PromptBuilderOptions): UGCPrompts {
  const scenes = [];

  // Scene settings to cycle through for diversity
  const sceneSettings = [
    "Modern kitchen with natural lighting",
    "Outdoor patio with golden hour lighting",
    "Cozy living room with warm ambient lighting",
    "Coffee shop with soft background lighting",
    "Car interior with natural daylight",
    "Bathroom mirror with overhead lighting",
    "Walking street with urban background",
    "Beach setting with natural sunlight"
  ];

  // Actor descriptors for diversity
  const actorDescriptors = [
    { gender: "woman", ethnicity: "Caucasian", hair: "blonde curly", age: 23 },
    { gender: "man", ethnicity: "Hispanic", hair: "dark short", age: 26 },
    { gender: "woman", ethnicity: "African American", hair: "natural textured", age: 24 },
    { gender: "man", ethnicity: "Asian", hair: "black styled", age: 27 },
    { gender: "woman", ethnicity: "Middle Eastern", hair: "long straight", age: 25 },
    { gender: "man", ethnicity: "Caucasian", hair: "brown wavy", age: 28 },
    { gender: "woman", ethnicity: "Latina", hair: "brown wavy", age: 22 },
    { gender: "man", ethnicity: "Mixed race", hair: "short fade", age: 29 }
  ];

  // Parse special requests for scene hints
  const sceneHints = extractSceneHints(options.specialRequests);
  
  for (let i = 0; i < options.sceneCount; i++) {
    const actor = actorDescriptors[i % actorDescriptors.length];
    const setting = sceneHints.length > 0 
      ? sceneHints[i % sceneHints.length] 
      : sceneSettings[i % sceneSettings.length];

    // Use individual dialogues for multiple scenes, or single dialogue for one scene
    const sceneDialogue = options.sceneCount === 1 
      ? options.dialogue 
      : (options.dialogues[i] || "This is amazing... you have to try this!");

    const scene = {
      scene_id: i + 1,
      image_prompt: {
        emotion: getRandomEmotion(),
        action: getSceneAction(i),
        character: `Young ${actor.gender}, ${actor.age}, ${actor.hair} hair, ${actor.ethnicity}, casual mobile selfie`,
        setting: setting,
        camera: "Amateur mobile front camera, slightly off-center framing, casual handheld",
        style: "UGC realism, authentic imperfections, natural lighting, slightly blurry amateur quality"
      },
      video_prompt: {
        dialogue: sceneDialogue,
        emotion: "natural enthusiasm",
        voice_type: `casual conversational ${actor.gender === 'woman' ? 'female' : 'male'}`,
        action: getVideoAction(i),
        character: `Same as image - Young ${actor.gender}, ${actor.age}, ${actor.ethnicity}`,
        setting: `Same as image - ${setting}`,
        camera: "Handheld phone video, natural movement, amateur mobile quality"
      },
      aspect_ratio_image: options.imageAspectRatio,
      aspect_ratio_video: options.videoAspectRatio,
      model: options.model
    };

    // Add product hint if provided
    if (options.productHint) {
      scene.image_prompt.action += `, showing ${options.productHint}`;
      scene.video_prompt.action += `, featuring ${options.productHint}`;
    }

    scenes.push(scene);
  }

  return { scenes };
}

function extractSceneHints(specialRequests: string): string[] {
  const hints = [];
  const requests = specialRequests.toLowerCase();
  
  if (requests.includes('podcast')) hints.push('Podcast recording setup with microphone');
  if (requests.includes('car')) hints.push('Car interior with dashboard visible');
  if (requests.includes('mirror')) hints.push('Bathroom mirror selfie with good lighting');
  if (requests.includes('walking')) hints.push('Walking outdoors with street background');
  if (requests.includes('shades')) hints.push('Outdoor setting wearing sunglasses');
  if (requests.includes('beach')) hints.push('Beach setting with ocean background');
  if (requests.includes('street interview')) hints.push('Urban street interview setting');
  
  return hints;
}

function getRandomEmotion(): string {
  const emotions = ['excited', 'surprised', 'delighted', 'amazed', 'thrilled', 'pleased'];
  return emotions[Math.floor(Math.random() * emotions.length)];
}

function getSceneAction(sceneIndex: number): string {
  const actions = [
    'holding product and taking first sip',
    'examining product label with interest',
    'showing product to camera enthusiastically',
    'comparing with another product',
    'opening product packaging',
    'sharing product with friend'
  ];
  return actions[sceneIndex % actions.length];
}

function getVideoAction(sceneIndex: number): string {
  const actions = [
    'taking first taste reaction',
    'explaining product benefits',
    'showing product features',
    'demonstrating product use',
    'sharing personal experience',
    'recommending to viewers'
  ];
  return actions[sceneIndex % actions.length];
}

function getDialogueSegment(fullDialogue: string, sceneIndex: number, totalScenes: number): string {
  if (totalScenes === 1) return fullDialogue;
  
  // Split dialogue by natural pauses or sentences
  const segments = fullDialogue.split(/[.!?]|\.{3}/).filter(s => s.trim());
  
  if (segments.length >= totalScenes) {
    return segments[sceneIndex]?.trim() + '...';
  }
  
  // If not enough segments, distribute evenly
  const wordsPerScene = Math.ceil(fullDialogue.split(' ').length / totalScenes);
  const words = fullDialogue.split(' ');
  const startIndex = sceneIndex * wordsPerScene;
  const endIndex = Math.min(startIndex + wordsPerScene, words.length);
  
  return words.slice(startIndex, endIndex).join(' ') + '...';
}
