import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUGCStore } from "@/hooks/use-ugc-generator";
import { Download, Play, Clock } from "lucide-react";

export function OutputsPanel() {
  const { scenes } = useUGCStore();

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const scenesWithContent = scenes.filter(scene => 
    scene.imageStatus === 'done' || scene.videoStatus === 'done'
  );

  return (
    <Card className="backdrop-blur-sm bg-card/80 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Download className="text-primary mr-3" />
          💾 Generated Assets
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Download your AI-generated UGC images and videos
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6" data-testid="outputs-container">
          {scenesWithContent.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <p>Generated content will appear here after processing</p>
            </div>
          ) : (
            scenesWithContent.map((scene, index) => (
              <div key={scene.id} className="border border-border rounded-lg p-4">
                <h4 className="font-medium text-card-foreground mb-3">Scene {scene.id}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Image Output */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-card-foreground">🖼️ Image</span>
                      {scene.imageUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(scene.imageUrl!, `scene-${scene.id}-image.jpg`)}
                          data-testid={`button-download-image-${scene.id}`}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                    {scene.imageUrl ? (
                      <img
                        src={scene.imageUrl}
                        alt={`Generated scene ${scene.id} image`}
                        className="w-full rounded-lg border border-border object-cover aspect-[2/3]"
                        data-testid={`img-scene-${scene.id}`}
                      />
                    ) : scene.imageStatus === 'error' ? (
                      <div className="w-full rounded-lg border border-destructive bg-destructive/10 aspect-[2/3] flex items-center justify-center">
                        <div className="text-center text-destructive">
                          <Clock className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm font-medium">Image Generation Failed</p>
                          <p className="text-xs">Please try again or contact support</p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full rounded-lg border border-border bg-muted aspect-[2/3] flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <Clock className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">Processing...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Video Output */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-card-foreground">🎥 Video</span>
                      {scene.videoUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(scene.videoUrl!, `scene-${scene.id}-video.mp4`)}
                          data-testid={`button-download-video-${scene.id}`}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                    {scene.videoUrl ? (
                      <video
                        controls
                        className="w-full rounded-lg border border-border aspect-[9/16]"
                        data-testid={`video-scene-${scene.id}`}
                      >
                        <source src={scene.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : scene.videoStatus === 'error' ? (
                      <div className="w-full rounded-lg border border-destructive bg-destructive/10 aspect-[9/16] flex items-center justify-center">
                        <div className="text-center text-destructive">
                          <Play className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm font-medium">Video Generation Failed</p>
                          <p className="text-xs">Please try again or contact support</p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full rounded-lg border border-border bg-muted aspect-[9/16] flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <Play className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">Video Player</p>
                          <p className="text-xs">Processing video...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
