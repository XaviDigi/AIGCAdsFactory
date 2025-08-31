import { convertGoogleDriveUrl } from "@/lib/utils";

interface ImageGenerationRequest {
  prompt: string;
  filesUrl: string[];
  size: string;
}

interface VideoGenerationRequest {
  prompt: string;
  model: string;
  aspectRatio: string;
  imageUrls: string;
}

interface KieResponse {
  code: number;
  data: {
    taskId: string;
  };
}

interface KieStatusResponse {
  code: number;
  data: {
    successFlag: number;
    response?: {
      resultUrls: string[];
    };
  };
}

interface KieCreditResponse {
  code: number;
  message: string;
  data: {
    credits: number;
  };
}

export class KieAPI {
  private apiKey: string;
  private mockMode: boolean;
  private baseUrl = 'https://api.kie.ai/api/v1';

  constructor(apiKey: string, mockMode: boolean = false) {
    this.apiKey = apiKey;
    this.mockMode = mockMode;
  }

  async generateImage(request: ImageGenerationRequest, imageModel: string = 'gpt4o-image'): Promise<string> {
    if (this.mockMode) {
      return this.mockImageGeneration();
    }

    // Convert Google Drive URLs
    const processedUrls = request.filesUrl.map(url => convertGoogleDriveUrl(url));

    // Choose endpoint based on model
    const endpoint = imageModel === 'flux-kontext' ? 'flux' : 'gpt4o-image';
    
    const response = await fetch(`${this.baseUrl}/${endpoint}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filesUrl: processedUrls,
        prompt: request.prompt,
        size: request.size,
        nVariants: 1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Image generation API error:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`Image generation failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data: KieResponse = await response.json();
    console.log('Generation API response:', data);
    const taskId = data.data.taskId;

    // Poll for completion
    return this.pollImageStatus(taskId);
  }

  async generateVideo(request: VideoGenerationRequest): Promise<string> {
    if (this.mockMode) {
      return this.mockVideoGeneration();
    }

    const response = await fetch(`${this.baseUrl}/veo/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: request.prompt,
        model: request.model,
        aspectRatio: request.aspectRatio,
        imageUrls: [request.imageUrls],
        enableFallback: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Video generation API error:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`Video generation failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data: KieResponse = await response.json();
    console.log('Generation API response:', data);
    const taskId = data.data.taskId;

    // Poll for completion
    return this.pollVideoStatus(taskId);
  }

  private async pollImageStatus(taskId: string): Promise<string> {
    const maxAttempts = 100; // About 5 minutes
    const pollInterval = 3000; // 3 seconds

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      try {
        const response = await fetch(`${this.baseUrl}/gpt4o-image/record-info?taskId=${taskId}`, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        });

        if (!response.ok) {
          continue;
        }

        const data: KieStatusResponse = await response.json();
        console.log('Polling response:', data);

        if (data.data.successFlag === 1 && data.data.response?.resultUrls?.[0]) {
          console.log('Found result URL:', data.data.response.resultUrls[0]);
          return data.data.response.resultUrls[0];
        }
      } catch (error) {
        console.warn(`Polling attempt ${attempt + 1} failed:`, error);
      }
    }

    throw new Error('Image generation timed out');
  }

  private async pollVideoStatus(taskId: string): Promise<string> {
    const maxAttempts = 120; // About 10 minutes (videos take longer)
    const pollInterval = 5000; // 5 seconds

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      try {
        const response = await fetch(`${this.baseUrl}/veo/record-info?taskId=${taskId}`, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        });

        if (!response.ok) {
          continue;
        }

        const data: KieStatusResponse = await response.json();
        console.log('Polling response:', data);

        if (data.data.successFlag === 1 && data.data.response?.resultUrls?.[0]) {
          console.log('Found result URL:', data.data.response.resultUrls[0]);
          return data.data.response.resultUrls[0];
        }
      } catch (error) {
        console.warn(`Polling attempt ${attempt + 1} failed:`, error);
      }
    }

    throw new Error('Video generation timed out');
  }

  private async mockImageGeneration(): Promise<string> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return a placeholder image URL
    return `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600&seed=${Math.random()}`;
  }

  private async mockVideoGeneration(): Promise<string> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Return a placeholder video URL
    return `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4?seed=${Math.random()}`;
  }

  async getCreditBalance(): Promise<number> {
    if (this.mockMode) {
      // Return mock credit balance
      return 2500;
    }

    try {
      const response = await fetch(`${this.baseUrl}/account/credits`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Credit balance fetch failed:', response.status, response.statusText);
        return 0;
      }

      const data: KieCreditResponse = await response.json();
      return data.data.credits;
    } catch (error) {
      console.error('Error fetching credit balance:', error);
      return 0;
    }
  }

  // Cost estimation based on Kie.ai pricing
  static getEstimatedCosts(sceneCount: number, model: string): { image: number; video: number; total: number } {
    // Image generation cost (estimated)
    const imageCostPerScene = 50; // credits per image
    
    // Video generation costs based on model
    const videoCostPerScene = model === 'veo3_fast' ? 80 : 400; // credits per video
    
    const imageCost = sceneCount * imageCostPerScene;
    const videoCost = sceneCount * videoCostPerScene;
    const totalCost = imageCost + videoCost;
    
    return {
      image: imageCost,
      video: videoCost,
      total: totalCost
    };
  }
}
