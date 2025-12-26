import { useEffect, useState } from 'react';
import { Cloud } from 'lucide-react';
import { useSync } from '../../context/SyncContext';
import { useAuth } from '../../context/AuthContext';

export default function SyncIndicator() {
  const { isAuthenticated } = useAuth();
  const { realtimeStatus, isSyncing } = useSync();
  const [showPulse, setShowPulse] = useState(false);

  // Show pulse animation when syncing
  useEffect(() => {
    if (isSyncing) {
      setShowPulse(true);
      const timer = setTimeout(() => setShowPulse(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isSyncing]);

  if (!isAuthenticated) return null;

  const isConnected = realtimeStatus === 'connected';

  return (
    <div 
      className={`
        fixed bottom-4 left-4 z-50
        flex items-center gap-2 px-3 py-2
        bg-white rounded-full shadow-lg border border-ink-200
        font-sans text-xs text-ink-600
        transition-all duration-300
        ${showPulse ? 'scale-105' : 'scale-100'}
      `}
    >
      <div className="relative">
        <Cloud size={16} className={isConnected ? 'text-green-600' : 'text-ink-400'} />
        {isConnected && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full">
            {showPulse && (
              <span className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
            )}
          </span>
        )}
      </div>
      <span className={isConnected ? 'text-green-700' : 'text-ink-500'}>
        {isSyncing ? 'Syncing...' : isConnected ? 'Live' : 'Offline'}
      </span>
    </div>
  );
}