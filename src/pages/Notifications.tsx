import { useState, useEffect } from "react";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  XCircle,
  Trash2,
  Check,
  Filter,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  device_id: string | null;
  created_at: string;
}

const typeConfig: Record<string, { icon: any; color: string; bg: string }> = {
  info: { icon: Info, color: "text-primary", bg: "bg-primary/20" },
  warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/20" },
  success: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/20" },
  error: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/20" },
};

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Subscribe to realtime updates
      const channel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              toast.info("New notification received!");
            }
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error("Failed to load notifications");
    } else {
      setNotifications(data || []);
    }
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    
    if (!error) {
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user?.id)
      .eq('is_read', false);
    
    if (error) {
      toast.error("Failed to mark all as read");
    } else {
      toast.success("All notifications marked as read");
      fetchNotifications();
    }
  };

  const deleteNotification = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error("Failed to delete notification");
    } else {
      toast.success("Notification deleted");
      fetchNotifications();
    }
  };

  const clearAll = async () => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user?.id);
    
    if (error) {
      toast.error("Failed to clear notifications");
    } else {
      toast.success("All notifications cleared");
      fetchNotifications();
    }
  };

  const addSampleNotification = async () => {
    const types = ['info', 'warning', 'success', 'error'];
    const titles = [
      'Temperature Alert',
      'Device Connected',
      'System Update',
      'Motion Detected'
    ];
    const messages = [
      'Room temperature exceeded threshold (28°C)',
      'Living Room Sensor is now online',
      'System update completed successfully',
      'Motion detected in restricted area'
    ];
    
    const randomIndex = Math.floor(Math.random() * types.length);
    
    const { error } = await supabase.from('notifications').insert({
      user_id: user?.id,
      title: titles[randomIndex],
      message: messages[randomIndex],
      type: types[randomIndex],
    });
    
    if (error) {
      toast.error("Failed to add notification");
    } else {
      toast.success("Sample notification added");
    }
  };

  const filteredNotifications = notifications.filter(n => 
    filter === "all" || !n.is_read
  );

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Stats & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <span className="text-sm">
              <span className="font-bold text-foreground">{unreadCount}</span>
              <span className="text-muted-foreground"> unread</span>
            </span>
          </div>
          
          <div className="flex gap-1 p-1 rounded-xl glass-card">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300",
                filter === "all" 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300",
                filter === "unread" 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Unread
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={addSampleNotification}
            className="btn-glass text-xs"
          >
            + Add Sample
          </button>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="btn-glass text-xs"
            >
              <Check className="w-3 h-3 mr-1" />
              Mark All Read
            </button>
          )}
          {notifications.length > 0 && (
            <button 
              onClick={clearAll}
              className="btn-glass text-xs text-red-400"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="glass-card p-12 text-center">
          <RefreshCw className="w-8 h-8 text-primary mx-auto animate-spin" />
          <p className="text-muted-foreground mt-4">Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No notifications</h3>
          <p className="text-muted-foreground">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification, index) => {
            const config = typeConfig[notification.type] || typeConfig.info;
            const Icon = config.icon;
            
            return (
              <div
                key={notification.id}
                className={cn(
                  "glass-card p-4 opacity-0 animate-fade-in-up transition-all duration-300",
                  !notification.is_read && "border-l-2 border-l-primary"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                    config.bg
                  )}>
                    <Icon className={cn("w-5 h-5", config.color)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className={cn(
                          "font-semibold text-foreground",
                          !notification.is_read && "text-primary"
                        )}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTime(notification.created_at)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3">
                      {!notification.is_read && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-primary hover:underline"
                        >
                          Mark as read
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(notification.id)}
                        className="text-xs text-muted-foreground hover:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
