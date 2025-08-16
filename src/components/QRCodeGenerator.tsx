import { Check, Copy, QrCode as QrCodeIcon } from "lucide-react";
import { useState } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface QRCodeGeneratorProps {
  peerId: string;
}

export function QRCodeGenerator({ peerId }: QRCodeGeneratorProps) {
  const [clicked, setClicked] = useState(false);

  const copyPeerId = () => {
    navigator.clipboard.writeText(peerId);
    setClicked(true);
    setTimeout(() => {
      setClicked(false);
    }, 1000);
    toast.success("Device ID copied to clipboard");
  };

  return (
    <Card className="p-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <QrCodeIcon className="h-5 w-5" />
          <h3>Share Your Device</h3>
        </div>

        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-lg border">
            <QRCode
              size={256}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={peerId}
              viewBox={`0 0 256 256`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Scan this QR code or share your Device ID:
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-muted rounded text-xs font-mono break-all">
              {peerId}
            </code>
            <Button size="sm" variant="outline" onClick={copyPeerId}>
              {clicked ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
