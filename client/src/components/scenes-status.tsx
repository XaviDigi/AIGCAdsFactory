import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUGCStore } from "@/hooks/use-ugc-generator";
import { CheckSquare, Image, Video, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export function ScenesStatus() {
  const { scenes, sceneCount } = useUGCStore();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'working':
        return <Loader2 className="w-3 h-3 animate-spin" />;
      case 'done':
        return <CheckCircle className="w-3 h-3" />;
      case 'error':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'working':
        return 'Working...';
      case 'done':
        return 'Done';
      case 'error':
        return 'Error';
      default:
        return 'Pending';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'working':
        return 'bg-primary text-primary-foreground';
      case 'done':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const renderScenes = () => {
    const scenesToRender = [];
    for (let i = 1; i <= sceneCount; i++) {
      const scene = scenes[i - 1];
      scenesToRender.push(
        <div key={i} className="border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-card-foreground">Scene {i}</h4>
            <Badge variant="secondary" className="text-xs">
              Ready
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center">
                <Image className="w-3 h-3 mr-2" />
                Create Image
              </span>
              <div className={`px-2 py-1 rounded text-xs font-medium flex items-center space-x-1 transition-all ${getStatusClass(scene?.imageStatus || 'idle')}`}>
                {getStatusIcon(scene?.imageStatus || 'idle')}
                <span>{getStatusText(scene?.imageStatus || 'idle')}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center">
                <Video className="w-3 h-3 mr-2" />
                Create Video
              </span>
              <div className={`px-2 py-1 rounded text-xs font-medium flex items-center space-x-1 transition-all ${getStatusClass(scene?.videoStatus || 'idle')}`}>
                {getStatusIcon(scene?.videoStatus || 'idle')}
                <span>{getStatusText(scene?.videoStatus || 'idle')}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return scenesToRender;
  };

  return (
    <Card className="backdrop-blur-sm bg-card/80 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckSquare className="text-primary mr-3" />
          Real-time Generation Status
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Monitor AI processing progress for each scene in real-time
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4" data-testid="scenes-status-container">
          {renderScenes()}
        </div>
      </CardContent>
    </Card>
  );
}
