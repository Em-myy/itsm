CREATE TABLE roles (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tickets (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    priority VARCHAR(150) NOT NULL, 
    related_asset VARCHAR(255) DEFAULT 'None',
    description TEXT NOT NULL,
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    picture TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE venues (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    capacity INT NOT NULL,
    status VARCHAR(255) NOT NULL,
    equipments TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    purpose VARCHAR(255) NOT NULL,
    venue_id INT NOT NULL REFERENCES venues(id) ON DELETE RESTRICT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    equipment_needed TEXT[],
    status VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, username, department, role_id)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'username', 'Unknown'),
        COALESCE(new.raw_user_meta_data->>'department', 'Unassigned'),
        1
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;    

CREATE POLICY "Tickets access policy"
ON public.tickets
FOR SELECT 
USING (
    auth.uid() = requester_id OR
    EXISTS (
        SELECT 1 FROM public.users
        INNER JOIN public.roles ON users.role_id = roles.id
        WHERE users.id = auth.uid() and roles.name = 'Admin'
    )
);

CREATE POLICY "Bookings access policy"
ON public.bookings
FOR SELECT 
USING (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM public.users
        INNER JOIN public.roles ON users.role_id = roles.id
        WHERE users.id = auth.uid() and roles.name = 'Admin'
    )
);


CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TRIGGER set_tickets_updated_at
    BEFORE UPDATE ON public.tickets
    FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TRIGGER set_venues_updated_at
    BEFORE UPDATE ON public.venues
    FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TRIGGER set_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();


CREATE OR REPLACE FUNCTION public.prevent_double_booking()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.bookings
        WHERE venue_id = NEW.venue_id
        AND STATUS  != 'Cancelled'
        AND (
            (NEW.start_time < end_time) AND (NEW.end_time > start_time)
        ) 
        AND id != COALESCE(NEW.id, -1)
    ) THEN 
        RAISE EXCEPTION 'Venue is already booking during this time period.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_venue_availability
    BEFORE INSERT OR UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.prevent_double_booking();


INSERT INTO storage.buckets (id, name, public)
VALUES ('ticket-attachments', 'ticket-attachments', true);

CREATE POLICY "Public Access"
ON storage.objects FOR SELECT USING (bucket_id = 'ticket-attachments');

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'ticket-attachments' AND auth.role() = 'authenticated'
);


INSERT INTO public.roles (name, description)
VALUES
    ('Staff', 'Regular Staffs'),
    ('IT Admin', 'IT Staff');

INSERT INTO public.venues (name, capacity, status, equipments)
VALUES 
    (
    'Main Council Chamber', 
    150, 
    'Available', 
    ARRAY['Projector', 'PA System', 'Microphones', 'Air Conditioning']
  ),
  (
    'IT Training Room', 
    30, 
    'Available', 
    ARRAY['Whiteboard', 'Smart TV', '20 Desktop Computers', 'High-Speed Router']
  );


CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    admin_status BOOLEAN;
BEGIN 
    SELECT EXISTS (
        SELECT 1 FROM public.users as u 
        INNER JOIN public.roles AS r ON u.role_id = r.id 
        WHERE u.id = auth.uid() AND r.name = 'Admin'
    ) INTO admin_status ;

    RETURN admin_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Roles are viewable by authenticated users"
ON public.roles
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Venues are viewable by authenticated users"
ON public.venues
FOR SELECT 
USING (auth.role() = 'authenticated');


CREATE POLICY "Admins can insert venues"
ON public.venues
FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update venues"
ON public.venues
FOR UPDATE 
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete venues"
ON public.venues
FOR DELETE 
USING (public.is_admin());

CREATE POLICY "Users access policy"
ON public.users
FOR SELECT 
USING (
    auth.uid() = id OR
    public.is_admin()
);


ALTER TABLE public.tickets  ADD COLUMN reference VARCHAR(255) UNIQUE; 