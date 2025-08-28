import { useState, useEffect } from "react";
import { ApiKeyModal } from "@/components/api-key-modal";
import { ConfigurationForm } from "@/components/configuration-form";
import { ScenesStatus } from "@/components/scenes-status";
import { PromptsPreview } from "@/components/prompts-preview";
import { OutputsPanel } from "@/components/outputs-panel";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Video, Settings, Circle } from "lucide-react";

export default function Home() {
  const [apiKey, setApiKey] = useState<string>("");
  const [mockMode, setMockMode] = useState<boolean>(false);
  const [showApiModal, setShowApiModal] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    // Check for saved API key
    const savedKey = localStorage.getItem('kieApiKey');
    if (savedKey) {
      setApiKey(savedKey);
      setShowApiModal(false);
      setIsInitialized(true);
    }
  }, []);

  const handleApiKeySubmit = (key: string, remember: boolean, isMock: boolean) => {
    if (isMock) {
      setMockMode(true);
      setApiKey("");
    } else {
      setApiKey(key);
      setMockMode(false);
      if (remember) {
        localStorage.setItem('kieApiKey', key);
      }
    }
    setShowApiModal(false);
    setIsInitialized(true);
  };

  const handleMockModeToggle = (enabled: boolean) => {
    setMockMode(enabled);
  };

  const clearApiKey = () => {
    localStorage.removeItem('kieApiKey');
    setApiKey("");
    setMockMode(false);
    setIsInitialized(false);
    setShowApiModal(true);
  };

  if (!isInitialized) {
    return (
      <ApiKeyModal
        open={showApiModal}
        onSubmit={handleApiKeySubmit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Video className="text-primary text-2xl" />
            <h1 className="text-2xl font-bold text-card-foreground">AI UGC Ads Factory</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Mock Mode</span>
              <Switch
                checked={mockMode}
                onCheckedChange={handleMockModeToggle}
                data-testid="toggle-mock-mode"
              />
              <Badge 
                variant={mockMode ? "secondary" : "default"}
                className="flex items-center space-x-1"
              >
                <Circle className={`w-2 h-2 ${mockMode ? 'text-amber-500' : 'text-green-500'}`} />
                <span>{mockMode ? 'Mock Mode' : 'Live API'}</span>
              </Badge>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={clearApiKey}
              data-testid="button-settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Configuration */}
        <div className="space-y-6">
          <ConfigurationForm 
            apiKey={apiKey}
            mockMode={mockMode}
          />
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          <ScenesStatus />
          <PromptsPreview />
          <OutputsPanel />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground flex items-center">
              <Circle className="w-3 h-3 mr-2" />
              For production, consider using a proxy server to secure API keys.
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>AI UGC Ads Factory</span>
              <span>•</span>
              <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
              <span>•</span>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
