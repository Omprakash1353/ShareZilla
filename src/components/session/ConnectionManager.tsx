import { Plus, QrCode, Users, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";

import { connectPeer, selectItem } from "@/store/connection/connectionSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";

interface ConnectionManagerProps {
  onShowQRScanner: () => void;
}

export function ConnectionManager({ onShowQRScanner }: ConnectionManagerProps) {
  const connection = useAppSelector((state) => state.connection);
  const dispatch = useAppDispatch();
  const [manualPeerId, setManualPeerId] = useState("");

  const handleManualConnect = () => {
    const trimmedId = manualPeerId.trim();
    if (trimmedId) {
      dispatch(connectPeer(trimmedId));
      setManualPeerId("");
    } else {
      toast.error("Please enter a valid Device ID");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleManualConnect();
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h3>Connected Devices</h3>
          <Badge variant="secondary">{connection.list.length}</Badge>
        </div>

        {/* Connection list */}
        <div className="space-y-2">
          {connection.list.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <WifiOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No devices connected</p>
            </div>
          ) : (
            connection.list.map((e, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
                onClick={() => {
                  dispatch(selectItem(e));
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center">
                    <Wifi
                      className={`h-4 w-4 ${
                        connection.selectedId === e
                          ? "text-emerald-500"
                          : "text-amber-500"
                      }`}
                    />
                    <div
                      className={`w-2 h-2 ${
                        connection.selectedId === e
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                      } rounded-full`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{e}</p>
                    <p className="text-xs text-muted-foreground">Connected</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-3 pt-4 border-t">
          <p className="text-sm font-medium">Connect to Device</p>

          {/* QR Scanner Button */}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={onShowQRScanner}
          >
            <QrCode className="h-4 w-4 mr-2" />
            Scan QR Code
          </Button>

          {/* Manual Connection */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Or enter Device ID:</p>
            <div className="flex gap-2">
              <Input
                placeholder="Device ID..."
                value={manualPeerId}
                onChange={(e) => setManualPeerId(e.target.value)}
                onKeyDown={handleKeyDown}
                className="font-mono text-sm"
              />
              <Button
                size="sm"
                onClick={handleManualConnect}
                disabled={!manualPeerId.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Connection Info */}
        <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
          <p>• Files are sent directly between devices</p>
          <p>• No data is stored on external servers</p>
          <p>• Both devices must be online</p>
        </div>
      </div>
    </Card>
  );
}
