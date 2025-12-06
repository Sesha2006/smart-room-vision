
-- Create room status enum
CREATE TYPE public.room_status AS ENUM ('active', 'maintenance', 'closed');

-- Create seat status enum  
CREATE TYPE public.seat_status AS ENUM ('available', 'reserved', 'occupied', 'offline', 'maintenance');

-- Create reservation status enum
CREATE TYPE public.reservation_status AS ENUM ('pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show');

-- Create rooms table
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  floor INTEGER NOT NULL DEFAULT 1,
  building TEXT,
  capacity INTEGER NOT NULL DEFAULT 20,
  status room_status DEFAULT 'active',
  features JSONB DEFAULT '[]'::jsonb,
  operating_hours JSONB DEFAULT '{"open": "08:00", "close": "22:00"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create seats table
CREATE TABLE public.seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  seat_number TEXT NOT NULL,
  row_position INTEGER NOT NULL,
  col_position INTEGER NOT NULL,
  status seat_status DEFAULT 'available',
  features JSONB DEFAULT '[]'::jsonb,
  sensor_id TEXT,
  last_occupied_at TIMESTAMPTZ,
  last_vacant_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(room_id, seat_number)
);

-- Create reservations table
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  seat_id UUID REFERENCES public.seats(id) ON DELETE CASCADE NOT NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  status reservation_status DEFAULT 'pending',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,
  auto_assigned BOOLEAN DEFAULT false,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create sensor_readings table for IoT data
CREATE TABLE public.sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seat_id UUID REFERENCES public.seats(id) ON DELETE CASCADE NOT NULL,
  sensor_type TEXT NOT NULL,
  value JSONB NOT NULL,
  confidence FLOAT DEFAULT 1.0,
  battery_level INTEGER,
  rssi INTEGER,
  is_online BOOLEAN DEFAULT true,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Create waitlist table
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  preferences JSONB DEFAULT '{}'::jsonb,
  priority INTEGER DEFAULT 0,
  requested_at TIMESTAMPTZ DEFAULT now(),
  notified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'waiting'
);

-- Create analytics table for metrics
CREATE TABLE public.room_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  hour INTEGER NOT NULL,
  occupancy_rate FLOAT DEFAULT 0,
  total_reservations INTEGER DEFAULT 0,
  no_shows INTEGER DEFAULT 0,
  avg_duration_minutes INTEGER DEFAULT 0,
  peak_occupancy INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(room_id, date, hour)
);

-- Enable RLS on all tables
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rooms (users can view all rooms, manage their own)
CREATE POLICY "Anyone can view rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Users can create rooms" ON public.rooms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rooms" ON public.rooms FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own rooms" ON public.rooms FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for seats (public read, admin write)
CREATE POLICY "Anyone can view seats" ON public.seats FOR SELECT USING (true);
CREATE POLICY "Room owners can manage seats" ON public.seats FOR ALL USING (
  EXISTS (SELECT 1 FROM public.rooms WHERE rooms.id = seats.room_id AND rooms.user_id = auth.uid())
);

-- RLS Policies for reservations
CREATE POLICY "Users can view own reservations" ON public.reservations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create reservations" ON public.reservations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reservations" ON public.reservations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reservations" ON public.reservations FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for sensor_readings (public read for dashboard)
CREATE POLICY "Anyone can view sensor readings" ON public.sensor_readings FOR SELECT USING (true);
CREATE POLICY "System can insert sensor readings" ON public.sensor_readings FOR INSERT WITH CHECK (true);

-- RLS Policies for waitlist
CREATE POLICY "Users can view own waitlist" ON public.waitlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can join waitlist" ON public.waitlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own waitlist" ON public.waitlist FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can leave waitlist" ON public.waitlist FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for analytics
CREATE POLICY "Anyone can view analytics" ON public.room_analytics FOR SELECT USING (true);
CREATE POLICY "System can insert analytics" ON public.room_analytics FOR INSERT WITH CHECK (true);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.seats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_readings;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_seats_updated_at BEFORE UPDATE ON public.seats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
