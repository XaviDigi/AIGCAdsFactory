import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, DollarSign, Zap } from "lucide-react";
import { KieAPI } from "@/lib/kie-api";

interface CreditInfoProps {
  apiKey: string;
  mockMode: boolean;
  sceneCount: number;
  model: string;
  onRefresh?: () => void;
}

export function CreditInfo({ apiKey, mockMode, sceneCount, model, onRefresh }: CreditInfoProps) {
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCreditBalance = async () => {
    if (!apiKey && !mockMode) return;
    
    setLoading(true);
    try {
      const kieAPI = new KieAPI(apiKey, mockMode);
      const balance = await kieAPI.getCreditBalance();
      setCreditBalance(balance);
      onRefresh?.();
    } catch (error) {
      console.error('Failed to fetch credit balance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreditBalance();
  }, [apiKey, mockMode]);

  const costs = KieAPI.getEstimatedCosts(sceneCount, model);
  const creditCost = costs.total;
  const dollarCost = (creditCost * 0.005).toFixed(2); // $0.005 per credit

  const hasEnoughCredits = creditBalance !== null && creditBalance >= creditCost;

  return (
    <Card className="backdrop-blur-sm bg-card/80 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <DollarSign className="text-primary mr-3" />
            💳 Credit Balance
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchCreditBalance}
            disabled={loading}
            data-testid="button-refresh-credits"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Balance */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">💰 Available Credits</span>
          <Badge variant={creditBalance && creditBalance > 1000 ? "default" : "secondary"}>
            {creditBalance !== null ? `${creditBalance.toLocaleString()} credits` : 'Loading...'}
          </Badge>
        </div>

        {/* Estimated Cost */}
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">🖼️ Image Cost ({sceneCount} scenes)</span>
            <span className="text-sm">{costs.image} credits</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">🎥 Video Cost ({model === 'veo3_fast' ? 'Fast' : 'Quality'})</span>
            <span className="text-sm">{costs.video} credits</span>
          </div>
          <div className="flex items-center justify-between font-medium pt-2 border-t border-border">
            <span className="text-sm">⚡ Total Estimated Cost</span>
            <div className="text-right">
              <div className="text-sm">{creditCost} credits</div>
              <div className="text-xs text-muted-foreground">${dollarCost}</div>
            </div>
          </div>
        </div>

        {/* Credit Status */}
        {creditBalance !== null && (
          <div className="pt-2">
            {hasEnoughCredits ? (
              <Badge variant="default" className="w-full justify-center">
                <Zap className="w-3 h-3 mr-1" />
                ✅ Sufficient Credits
              </Badge>
            ) : (
              <Badge variant="destructive" className="w-full justify-center">
                ⚠️ Insufficient Credits
              </Badge>
            )}
          </div>
        )}

        {mockMode && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
            🎭 Mock Mode - Using simulated credit balance
          </div>
        )}
      </CardContent>
    </Card>
  );
}