import { useState, useEffect } from "react";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Moon, 
  Database,
  Info,
  ExternalLink,
  Check,
  Loader2,
  User,
  Shield,
  Wifi
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

const Toggle = ({ enabled, onToggle }: ToggleProps) => (
  <button
    onClick={onToggle}
    className={cn(
      "relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300",
      enabled 
        ? "bg-gradient-to-r from-primary to-secondary" 
        : "bg-white/10"
    )}
  >
    <span
      className={cn(
        "inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300",
        enabled ? "translate-x-6" : "translate-x-1"
      )}
    />
  </button>
);

const Settings = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [fullName, setFullName] = useState("");
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user?.id)
      .maybeSingle();
    
    if (data) {
      setFullName(data.full_name || "");
    }
  };

  const saveProfile = async () => {
    setIsSaving(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, updated_at: new Date().toISOString() })
      .eq('id', user?.id);
    
    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Profile updated successfully");
    }
    setIsSaving(false);
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus("idle");
    
    try {
      // Test database connection
      const { error } = await supabase.from('profiles').select('id').limit(1);
      
      if (error) throw error;
      
      setConnectionStatus("success");
      toast.success("Database connection successful!");
    } catch (error) {
      setConnectionStatus("error");
      toast.error("Connection failed");
    }
    
    setIsTestingConnection(false);
    
    // Reset status after 3 seconds
    setTimeout(() => setConnectionStatus("idle"), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Profile Settings */}
      <div 
        className="glass-card p-6 opacity-0 animate-fade-in-up"
        style={{ animationDelay: "0ms" }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Profile</h3>
            <p className="text-sm text-muted-foreground">Manage your account details</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="input-glass opacity-60 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-glass"
              placeholder="Enter your name"
            />
          </div>

          <button
            onClick={saveProfile}
            disabled={isSaving}
            className="btn-glow flex items-center justify-center gap-2 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Profile"
            )}
          </button>
        </div>
      </div>

      {/* General Settings */}
      <div 
        className="glass-card p-6 opacity-0 animate-fade-in-up"
        style={{ animationDelay: "100ms" }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">General</h3>
            <p className="text-sm text-muted-foreground">Manage app preferences</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Dark Mode */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Use dark theme interface</p>
              </div>
            </div>
            <Toggle enabled={darkMode} onToggle={() => setDarkMode(!darkMode)} />
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Notifications</p>
                <p className="text-sm text-muted-foreground">Receive alert notifications</p>
              </div>
            </div>
            <Toggle enabled={notifications} onToggle={() => setNotifications(!notifications)} />
          </div>
        </div>
      </div>

      {/* Database Connection */}
      <div 
        className="glass-card p-6 opacity-0 animate-fade-in-up"
        style={{ animationDelay: "200ms" }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Database className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Backend Connection</h3>
            <p className="text-sm text-muted-foreground">Lovable Cloud status</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div className="flex items-center gap-3">
              <Wifi className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="font-medium text-foreground">Status</p>
                <p className="text-sm text-muted-foreground">Real-time database connection</p>
              </div>
            </div>
            <span className="badge-success">Connected</span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Security</p>
                <p className="text-sm text-muted-foreground">Row Level Security enabled</p>
              </div>
            </div>
            <span className="badge-success">Active</span>
          </div>

          {/* Test Connection Button */}
          <button
            onClick={testConnection}
            disabled={isTestingConnection}
            className={cn(
              "btn-glow w-full flex items-center justify-center gap-2 text-white",
              isTestingConnection && "opacity-70 cursor-not-allowed",
              connectionStatus === "success" && "bg-gradient-to-r from-emerald-500 to-emerald-600",
              connectionStatus === "error" && "bg-gradient-to-r from-red-500 to-red-600"
            )}
          >
            {isTestingConnection ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Testing Connection...
              </>
            ) : connectionStatus === "success" ? (
              <>
                <Check className="w-4 h-4" />
                Connection Successful
              </>
            ) : connectionStatus === "error" ? (
              "Connection Failed - Retry"
            ) : (
              "Test Connection"
            )}
          </button>
        </div>
      </div>

      {/* About */}
      <div 
        className="glass-card p-6 opacity-0 animate-fade-in-up"
        style={{ animationDelay: "300ms" }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <Info className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">About</h3>
            <p className="text-sm text-muted-foreground">Application information</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <span className="text-muted-foreground">App Name</span>
            <span className="font-medium gradient-text">SmartRoom Premium</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <span className="text-muted-foreground">Version</span>
            <span className="font-mono text-foreground">1.0.0</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <span className="text-muted-foreground">Edition</span>
            <span className="badge-success">Premium Edition</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <span className="text-muted-foreground">Backend</span>
            <span className="text-primary">SmartRoom</span>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div 
        className="text-center text-sm text-muted-foreground opacity-0 animate-fade-in"
        style={{ animationDelay: "400ms" }}
      >
   
        <p className="mt-1">© 2025 SmartRoom Premium. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Settings;
