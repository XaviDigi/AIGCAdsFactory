import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUGCStore } from "@/hooks/use-ugc-generator";
import { Code, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";

export function PromptsPreview() {
  const { prompts } = useUGCStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const jsonString = JSON.stringify(prompts, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Code className="text-primary mr-3" />
            Generated Prompts
          </CardTitle>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            data-testid="button-copy-prompts"
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1.5" />
                Copy
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-muted rounded-lg p-4">
          <pre 
            className="text-sm font-mono text-muted-foreground whitespace-pre-wrap overflow-x-auto"
            data-testid="prompts-preview-json"
          >
            {prompts ? JSON.stringify(prompts, null, 2) : '{\n  "scenes": []\n}'}
          </pre>
        </div>
        
        <p className="text-xs text-muted-foreground mt-3 flex items-center">
          <Code className="w-3 h-3 mr-1" />
          Preview of prompts that will be sent to the Kie API
        </p>
      </CardContent>
    </Card>
  );
}
