import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Armchair, 
  Clock, 
  Calendar,
  Zap, 
  Sun, 
  Volume2,
  Monitor,
  Accessibility,
  Sparkles,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Seat } from "./SeatMap";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  seat: Seat | null;
  onConfirm: (duration: number, autoAssign: boolean) => void;
  isLoading?: boolean;
}

const ReservationModal = ({ 
  isOpen, 
  onClose, 
  seat, 
  onConfirm,
  isLoading = false 
}: ReservationModalProps) => {
  const [duration, setDuration] = useState(60); // minutes
  const [autoAssign, setAutoAssign] = useState(false);
  const [step, setStep] = useState<'configure' | 'confirm'>('configure');

  const handleConfirm = () => {
    if (step === 'configure') {
      setStep('confirm');
    } else {
      onConfirm(duration, autoAssign);
    }
  };

  const handleClose = () => {
    setStep('configure');
    setDuration(60);
    setAutoAssign(false);
    onClose();
  };

  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins} minutes`;
    const hours = Math.floor(mins / 60);
    const remaining = mins % 60;
    return remaining > 0 ? `${hours}h ${remaining}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const getEndTime = () => {
    const end = new Date(Date.now() + duration * 60 * 1000);
    return end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!seat) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-card border-white/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Armchair className="w-5 h-5 text-primary" />
            {step === 'configure' ? 'Reserve Seat' : 'Confirm Reservation'}
          </DialogTitle>
          <DialogDescription>
            {step === 'configure' 
              ? `Configure your reservation for Seat ${seat.seatNumber}`
              : 'Review and confirm your booking'}
          </DialogDescription>
        </DialogHeader>

        {step === 'configure' ? (
          <div className="space-y-6 py-4">
            {/* Seat Info */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 border-2 border-emerald-500/50 flex items-center justify-center">
                <div className="text-center">
                  <Armchair className="w-6 h-6 text-emerald-400 mx-auto" />
                  <span className="text-xs font-medium text-emerald-300">{seat.seatNumber}</span>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Seat {seat.seatNumber}</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {seat.features.hasPowerOutlet && (
                    <Badge variant="outline" className="text-xs gap-1 border-yellow-500/30 text-yellow-400">
                      <Zap className="w-3 h-3" /> Power
                    </Badge>
                  )}
                  {seat.features.hasWindow && (
                    <Badge variant="outline" className="text-xs gap-1 border-orange-500/30 text-orange-400">
                      <Sun className="w-3 h-3" /> Window
                    </Badge>
                  )}
                  {seat.features.isQuietZone && (
                    <Badge variant="outline" className="text-xs gap-1 border-blue-500/30 text-blue-400">
                      <Volume2 className="w-3 h-3" /> Quiet
                    </Badge>
                  )}
                  {seat.features.hasMonitor && (
                    <Badge variant="outline" className="text-xs gap-1 border-purple-500/30 text-purple-400">
                      <Monitor className="w-3 h-3" /> Monitor
                    </Badge>
                  )}
                  {seat.features.isAccessible && (
                    <Badge variant="outline" className="text-xs gap-1 border-cyan-500/30 text-cyan-400">
                      <Accessibility className="w-3 h-3" /> Accessible
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Duration Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Duration
                </Label>
                <span className="text-sm font-medium text-primary">
                  {formatDuration(duration)}
                </span>
              </div>
              <Slider
                value={[duration]}
                onValueChange={([value]) => setDuration(value)}
                min={30}
                max={240}
                step={30}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>30 min</span>
                <span>1 hour</span>
                <span>2 hours</span>
                <span>4 hours</span>
              </div>
            </div>

            {/* Time Preview */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-white/5">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm">
                  <span className="text-muted-foreground">Now</span>
                  <span className="mx-2">→</span>
                  <span className="font-medium text-primary">{getEndTime()}</span>
                </p>
              </div>
            </div>

            {/* Auto-assign Option */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-white/5">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <div>
                  <Label htmlFor="auto-assign" className="cursor-pointer">Smart Auto-assign</Label>
                  <p className="text-xs text-muted-foreground">Let AI pick the best seat based on preferences</p>
                </div>
              </div>
              <Switch
                id="auto-assign"
                checked={autoAssign}
                onCheckedChange={setAutoAssign}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Confirmation Summary */}
            <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Ready to Book</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seat:</span>
                  <span className="font-medium">{seat.seatNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{formatDuration(duration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Until:</span>
                  <span className="font-medium">{getEndTime()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Auto-assign:</span>
                  <span className="font-medium">{autoAssign ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              By confirming, you agree to check in within 15 minutes or your reservation may be auto-released.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={step === 'confirm' ? () => setStep('configure') : handleClose}
            className="flex-1"
          >
            {step === 'confirm' ? 'Back' : 'Cancel'}
          </Button>
          <Button 
            onClick={handleConfirm}
            className="flex-1 bg-gradient-to-r from-primary to-primary/80"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Booking...
              </>
            ) : (
              step === 'configure' ? 'Continue' : 'Confirm Booking'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationModal;
