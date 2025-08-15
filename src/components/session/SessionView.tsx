import { Download, Laptop, Lock, Smartphone, Upload, Wifi } from "lucide-react";
import React from "react";

interface SessionViewProps {
  handleStartSession: () => void;
  loading: boolean;
}

const SessionView: React.FC<SessionViewProps> = ({
  handleStartSession,
  loading,
}) => {
  return (
    <section className="flex flex-col items-center gap-6">
      {/* Device UI */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 blur-xl opacity-20 scale-110 rounded-3xl" />
        <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-0 rounded-3xl shadow-2xl">
          <div className="bg-gray-900 w-80 h-48 rounded-2xl flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl" />
            <div className="relative z-10 text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="flex items-center gap-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <Wifi className="size-5" />
                </div>
                <div className="text-gray-400">|</div>
                <div className="flex items-center gap-2 text-blue-400">
                  <Lock className="size-4" />
                  <span className="text-sm">Secured</span>
                </div>
              </div>
              <div className="text-gray-300 text-sm mb-2">
                Ready to transfer
              </div>
              <div className="flex items-center justify-center gap-3">
                <Smartphone className="size-6 text-blue-400" />
                <div className="flex gap-1">
                  {[0, 0.2, 0.4].map((d, i) => (
                    <div
                      key={i}
                      className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"
                      style={{ animationDelay: `${d}s` }}
                    />
                  ))}
                </div>
                <Laptop className="size-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -top-3 -right-3 badge badge-accent px-3 py-1 shadow-lg">
          Online
        </div>
        <div className="absolute -bottom-3 -left-3 badge badge-warning px-3 py-1 shadow-lg">
          P2P Ready
        </div>
      </div>

      {/* Start/Receive Buttons */}
      <div className="flex gap-6">
        <button
          className="btn btn-info w-28"
          onClick={handleStartSession}
          disabled={loading}
        >
          <Upload className="size-5 mr-2" />
          Send
        </button>
        <button
          className="btn btn-error w-28"
          onClick={handleStartSession}
          disabled={loading}
        >
          <Download className="size-5 mr-2" />
          Receive
        </button>
      </div>
    </section>
  );
};

export default SessionView;
