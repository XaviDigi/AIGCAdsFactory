import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Key } from "lucide-react";

interface ApiKeyModalProps {
  open: boolean;
  onSubmit: (apiKey: string, remember: boolean, isMock: boolean) => void;
}

export function ApiKeyModal({ open, onSubmit }: ApiKeyModalProps) {
  const [apiMode, setApiMode] = useState<string>("live");
  const [apiKey, setApiKey] = useState<string>("");
  const [remember, setRemember] = useState<boolean>(false);

  const handleSubmit = () => {
    if (apiMode === "live" && !apiKey.trim()) {
      alert('Please enter your Kie API key or select Mock Mode');
      return;
    }
    
    onSubmit(apiKey, remember, apiMode === "mock");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onSubmit("", false, true); }}>
      <DialogContent className="w-full max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Key className="text-primary mr-3 text-xl" />
            API Key Required
          </DialogTitle>
        </DialogHeader>
        
        <p className="text-muted-foreground mb-6">
          Choose how you'd like to use AI UGC Ads Factory:
        </p>
        
        <RadioGroup value={apiMode} onValueChange={setApiMode} className="space-y-4">
          {/* Live API Option */}
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="live" id="live" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="live" className="font-medium text-card-foreground cursor-pointer">
                  Use Live Kie API
                </Label>
                <p className="text-sm text-muted-foreground mb-3">Generate real content with your API key</p>
                <Input
                  type="password"
                  placeholder="Enter your Kie API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={apiMode !== "live"}
                  data-testid="input-api-key"
                />
                <div className="flex items-center mt-2">
                  <Checkbox
                    id="remember"
                    checked={remember}
                    onCheckedChange={(checked) => setRemember(checked as boolean)}
                    disabled={apiMode !== "live"}
                    data-testid="checkbox-remember"
                  />
                  <Label htmlFor="remember" className="ml-2 text-sm text-muted-foreground cursor-pointer">
                    Remember in this browser
                  </Label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mock Mode Option */}
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="mock" id="mock" className="mt-1" />
              <div>
                <Label htmlFor="mock" className="font-medium text-card-foreground cursor-pointer">
                  Mock Mode
                </Label>
                <p className="text-sm text-muted-foreground">Preview the interface with placeholder content</p>
              </div>
            </div>
          </div>
        </RadioGroup>
        
        <Button 
          onClick={handleSubmit}
          className="w-full mt-6"
          data-testid="button-continue"
        >
          Continue
        </Button>
      </DialogContent>
    </Dialog>
  );
}
