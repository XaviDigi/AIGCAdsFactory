import { useState, useEffect } from "react";
import { ApiKeyModal } from "@/components/api-key-modal";
import { ConfigurationForm } from "@/components/configuration-form";
import { ScenesStatus } from "@/components/scenes-status";
import { OutputsPanel } from "@/components/outputs-panel";
import { CreditInfo } from "@/components/credit-info";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Video, Settings, Circle, Sun, Moon } from "lucide-react";

export default function Home() {
  const [apiKey, setApiKey] = useState<string>("");
  const [mockMode, setMockMode] = useState<boolean>(false);
  const [showApiModal, setShowApiModal] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [sceneCount, setSceneCount] = useState<number>(1);
  const [model, setModel] = useState<string>("veo3_fast");

  useEffect(() => {
    // Check for saved API key
    const savedKey = localStorage.getItem('kieApiKey');
    if (savedKey) {
      setApiKey(savedKey);
      setShowApiModal(false);
      setIsInitialized(true);
    }
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    if (newIsDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

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
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary/20 via-accent to-primary/20 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
            UGC on the go
          </h1>
          <p className="text-lg text-muted-foreground mb-1">by Xavi Digi</p>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Create authentic user-generated content advertisements with AI. Transform reference images into multiple diverse scenes with authentic mobile aesthetics and natural dialogue.
          </p>
        </div>
      </div>

      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Video className="text-primary text-2xl" />
            <h1 className="text-xl font-semibold text-card-foreground">AI UGC Ads Factory</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">🎭 Mock Mode</span>
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
                <span>{mockMode ? '🟡 Mock Mode' : '🟢 Live API'}</span>
              </Badge>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              data-testid="toggle-theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            
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

      {/* AI Features Overview */}
      <section className="bg-card/50 border-y border-border py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-card-foreground">AI-Powered Generation</h3>
              <p className="text-sm text-muted-foreground">Advanced VEO3 models create authentic UGC-style content</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-card-foreground">Diverse Actors</h3>
              <p className="text-sm text-muted-foreground">Automatically generates diverse, authentic-looking people</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-card-foreground">📱 Mobile Aesthetics</h3>
              <p className="text-sm text-muted-foreground">Amateur mobile quality with natural imperfections</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Configuration */}
        <div className="space-y-6">
          <ConfigurationForm 
            apiKey={apiKey}
            mockMode={mockMode}
            sceneCount={sceneCount}
            setSceneCount={setSceneCount}
            model={model}
            setModel={setModel}
          />
          
          {/* Usage Examples */}
          <div className="bg-accent/30 border border-border rounded-lg p-4">
            <h3 className="font-semibold text-card-foreground mb-3 flex items-center">
              <Video className="w-4 h-4 mr-2 text-primary" />
              Usage Examples
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-muted-foreground">
                  <span className="font-medium text-card-foreground">Product Launch:</span> Upload product image + "Just tried this new energy drink and wow..."
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-muted-foreground">
                  <span className="font-medium text-card-foreground">Food & Beverage:</span> Restaurant dish + "This place is hidden gem in downtown..."
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-muted-foreground">
                  <span className="font-medium text-card-foreground">Fashion:</span> Clothing item + "Found this at the thrift store and it's perfect..."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          <CreditInfo 
            apiKey={apiKey} 
            mockMode={mockMode} 
            sceneCount={sceneCount} 
            model={model}
          />
          <ScenesStatus />
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
