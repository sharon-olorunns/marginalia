import { LogOut, Cloud, CloudOff, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Popover } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { useSync } from '../../context/SyncContext';

export default function UserMenu({ onSignInClick }) {
  const { user, isAuthenticated, isConfigured, signOut } = useAuth();
  const { isSyncing, lastSynced, realtimeStatus, handleFullSync } = useSync();

  // Format last synced time
  const formatLastSynced = () => {
    if (!lastSynced) return 'Never';
    const now = new Date();
    const diff = now - lastSynced;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return lastSynced.toLocaleDateString();
  };

  // Get realtime status display
  const getRealtimeDisplay = () => {
    switch (realtimeStatus) {
      case 'connected':
        return { icon: Wifi, text: 'Live sync active', color: 'text-green-600' };
      case 'connecting':
        return { icon: RefreshCw, text: 'Connecting...', color: 'text-amber-600' };
      case 'error':
        return { icon: WifiOff, text: 'Connection error', color: 'text-red-600' };
      default:
        return { icon: WifiOff, text: 'Offline', color: 'text-ink-400' };
    }
  };

  const realtimeDisplay = getRealtimeDisplay();
  const RealtimeIcon = realtimeDisplay.icon;

  // Not configured - show disabled state
  if (!isConfigured) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 text-ink-400 font-sans text-sm">
        <CloudOff size={18} />
        <span className="hidden sm:inline">Local only</span>
      </div>
    );
  }

  // Not signed in - show sign in button
  if (!isAuthenticated) {
    return (
      <button
        onClick={onSignInClick}
        className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 text-white rounded-lg font-sans text-sm hover:bg-amber-700 transition-colors"
      >
        <Cloud size={18} />
        <span className="hidden sm:inline">Sign In</span>
      </button>
    );
  }

  // Signed in - show user menu
  return (
    <Popover
      trigger={
        <button className="flex items-center gap-2 px-3 py-1.5 bg-ink-100 text-ink-700 rounded-lg font-sans text-sm hover:bg-ink-200 transition-colors">
          <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-medium">
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:inline max-w-[120px] truncate">
            {user.email}
          </span>
          {isSyncing ? (
            <RefreshCw size={14} className="animate-spin text-ink-400" />
          ) : realtimeStatus === 'connected' ? (
            <span className="w-2 h-2 rounded-full bg-green-500" title="Live sync active" />
          ) : null}
        </button>
      }
      align="end"
    >
      {({ close }) => (
        <div className="py-1 min-w-[240px]">
          <div className="px-3 py-2 border-b border-ink-100">
            <p className="font-sans text-xs text-ink-500">Signed in as</p>
            <p className="font-sans text-sm text-ink-900 truncate">{user.email}</p>
          </div>
          
          <div className="px-3 py-2 border-b border-ink-100 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-600">
                <Cloud size={16} />
                <span className="font-sans text-sm">Cloud sync enabled</span>
              </div>
            </div>
            
            <div className={`flex items-center gap-2 ${realtimeDisplay.color}`}>
              <RealtimeIcon size={14} className={realtimeStatus === 'connecting' ? 'animate-spin' : ''} />
              <span className="font-sans text-xs">{realtimeDisplay.text}</span>
            </div>
            
            <p className="font-sans text-xs text-ink-400">
              Last synced: {formatLastSynced()}
            </p>
          </div>

          <Popover.Item
            icon={RefreshCw}
            onClick={() => {
              handleFullSync();
              close();
            }}
          >
            {isSyncing ? 'Syncing...' : 'Sync now'}
          </Popover.Item>
          
          <Popover.Divider />
          
          <Popover.Item
            icon={LogOut}
            onClick={() => {
              signOut();
              close();
            }}
          >
            Sign out
          </Popover.Item>
        </div>
      )}
    </Popover>
  );
}