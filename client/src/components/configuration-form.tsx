import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useUGCGenerator } from "@/hooks/use-ugc-generator";
import { Sliders, Info, MessageSquareMore, Tag, Play, Copy } from "lucide-react";

interface ConfigurationFormProps {
  apiKey: string;
  mockMode: boolean;
}

export function ConfigurationForm({ apiKey, mockMode }: ConfigurationFormProps) {
  const [referenceImage, setReferenceImage] = useState("https://drive.google.com/file/d/1g1rSWs6OgNASMeV8Ejx9fzCVHhnVEOCN/view?usp=sharing");
  const [sceneCount, setSceneCount] = useState(3);
  const [dialogue, setDialogue] = useState("So TikTok made me buy this... and it turns out it's the best tasting fruit beer in Sydney? And they donate their profits to charity! And you know what it's honestly really good!");
  const [model, setModel] = useState("veo3_fast");
  const [imageAspectRatio, setImageAspectRatio] = useState("2:3");
  const [videoAspectRatio, setVideoAspectRatio] = useState("9:16");
  const [specialRequests, setSpecialRequests] = useState("");
  const [productHint, setProductHint] = useState("");

  const { generateScenes, copyPromptsJSON, isGenerating } = useUGCGenerator({
    apiKey,
    mockMode,
    sceneCount,
    referenceImage,
    dialogue,
    model,
    imageAspectRatio,
    videoAspectRatio,
    specialRequests,
    productHint
  });

  const handleDialogueChange = (value: string) => {
    // Validate no hyphens or em dashes
    if (value.includes('-') || value.includes('—')) {
      return;
    }
    setDialogue(value);
  };

  const handleGenerate = () => {
    if (dialogue.length > 200) {
      alert('Dialogue must be 200 characters or less');
      return;
    }
    
    if (!dialogue.trim()) {
      setDialogue("This is amazing... you have to try this!");
    }
    
    generateScenes();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sliders className="text-primary mr-3" />
          Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Reference Image URL */}
        <div>
          <Label htmlFor="referenceImage" className="block text-sm font-medium mb-2">
            Reference Image URL
          </Label>
          <Input
            id="referenceImage"
            type="url"
            value={referenceImage}
            onChange={(e) => setReferenceImage(e.target.value)}
            placeholder="Enter Google Drive share link or direct image URL"
            data-testid="input-reference-image"
          />
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            <Info className="w-3 h-3 mr-1" />
            Google Drive links will be auto-converted to direct download URLs
          </p>
        </div>

        {/* Number of Scenes */}
        <div>
          <Label htmlFor="sceneCount" className="block text-sm font-medium mb-2">
            Number of Scenes
          </Label>
          <Input
            id="sceneCount"
            type="number"
            min={1}
            max={12}
            value={sceneCount}
            onChange={(e) => setSceneCount(parseInt(e.target.value) || 1)}
            data-testid="input-scene-count"
          />
          <p className="text-xs text-muted-foreground mt-1">1-12 scenes</p>
        </div>

        {/* Dialogue */}
        <div>
          <Label htmlFor="dialogue" className="block text-sm font-medium mb-2">
            Dialogue
          </Label>
          <Textarea
            id="dialogue"
            rows={3}
            maxLength={200}
            value={dialogue}
            onChange={(e) => handleDialogueChange(e.target.value)}
            placeholder="Natural, conversational tone. Use ... for pauses."
            className="resize-none"
            data-testid="textarea-dialogue"
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-muted-foreground flex items-center">
              <MessageSquareMore className="w-3 h-3 mr-1" />
              Natural, conversational tone. No hyphens or em dashes.
            </p>
            <span className={`text-xs ${dialogue.length > 180 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {dialogue.length}/200
            </span>
          </div>
        </div>

        {/* Model Selection */}
        <div>
          <Label className="block text-sm font-medium mb-2">Model</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger data-testid="select-model">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="veo3_fast">veo3_fast (Recommended)</SelectItem>
              <SelectItem value="veo3">veo3 (Higher Quality)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Aspect Ratios */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="block text-sm font-medium mb-2">Image Aspect Ratio</Label>
            <Select value={imageAspectRatio} onValueChange={setImageAspectRatio}>
              <SelectTrigger data-testid="select-image-aspect">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2:3">2:3 (Portrait)</SelectItem>
                <SelectItem value="3:2">3:2 (Landscape)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="block text-sm font-medium mb-2">Video Aspect Ratio</Label>
            <Select value={videoAspectRatio} onValueChange={setVideoAspectRatio}>
              <SelectTrigger data-testid="select-video-aspect">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="9:16">9:16 (Mobile)</SelectItem>
                <SelectItem value="16:9">16:9 (Desktop)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Special Requests */}
        <div>
          <Label htmlFor="specialRequests" className="block text-sm font-medium mb-2">
            Special Requests
          </Label>
          <Textarea
            id="specialRequests"
            rows={3}
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Age 21-29, diversity preferences, scene hints (podcast, car, mirror, walking, shades, beach, street interview)"
            className="resize-none"
            data-testid="textarea-special-requests"
          />
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            <Tag className="w-3 h-3 mr-1" />
            Optional scene and actor preferences
          </p>
        </div>

        {/* Product/Brand Hint */}
        <div>
          <Label htmlFor="productHint" className="block text-sm font-medium mb-2">
            Product/Brand Hint
          </Label>
          <Input
            id="productHint"
            value={productHint}
            onChange={(e) => setProductHint(e.target.value)}
            placeholder="Optional: preserve specific text or branding in images"
            data-testid="input-product-hint"
          />
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            <Tag className="w-3 h-3 mr-1" />
            Helps preserve label text in generated images
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex-1"
            data-testid="button-generate"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                Generating...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Generate
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={copyPromptsJSON}
            data-testid="button-copy-json"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy JSON
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
