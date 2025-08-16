"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { connectPeer } from "@/store/connection/connectionSlice";
import { useAppDispatch } from "@/store/hooks";
import QrScanner from "qr-scanner";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface QRCodeScannerProps {
  open: boolean;
  onClose: () => void;
}

export function QRCodeScanner({ open, onClose }: QRCodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const dispatch = useAppDispatch();

  // Handle QR scan result
  const handleScan = (result: QrScanner.ScanResult) => {
    if (result?.data) {
      console.log("Scanned QR:", result.data);
      toast.success("QR Code Scanned!");
      dispatch(connectPeer(result.data));

      stopScanner();
      onClose();
    }
  };

  // Start scanner
  const startScanner = async () => {
    if (videoRef.current && !scannerRef.current) {
      const scanner = new QrScanner(videoRef.current, handleScan, {
        highlightScanRegion: true,
        highlightCodeOutline: true,
      });
      scannerRef.current = scanner;

      try {
        await scanner.start();
        setIsScanning(true);
      } catch (error) {
        console.error("Camera access denied:", error);
        toast.error("Could not access camera");
      }
    }
  };

  // Stop & clean up
  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (open) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => stopScanner();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(state) => !state && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
          <DialogDescription>
            Position the QR code inside the frame to scan automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="relative bg-black rounded-lg overflow-hidden h-[300px]">
          <video ref={videoRef} className="w-full h-full object-cover" />
          {/* Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 border-4 border-green-500 rounded-lg animate-pulse" />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {isScanning ? (
            <Button variant="destructive" onClick={stopScanner}>
              Stop
            </Button>
          ) : (
            <Button onClick={startScanner}>Start</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
