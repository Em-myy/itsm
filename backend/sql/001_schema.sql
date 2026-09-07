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
        WHERE users.id = auth.uid() and roles.name = 'IT Admin'
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
        WHERE users.id = auth.uid() and roles.name = 'IT Admin'
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
        WHERE u.id = auth.uid() AND r.name = 'IT Admin'
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

ALTER TABLE tickets
ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Pending'
CHECK (status IN ('Pending', 'In Progress', 'Resolved', 'Cancelled'));

ALTER TABLE public.bookings  ADD COLUMN reference VARCHAR(255) UNIQUE; 

ALTER TABLE bookings
ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Pending'
CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Cancelled'));

CREATE TABLE assets (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reference VARCHAR(50) UNIQUE,
    type VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    last_serviced TIMESTAMP,
    notes TEXT,
    assignee_name VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

ALTER TABLE assets
ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Active'
CHECK (status IN ('Active', 'Maintenance', 'Retired'));

CREATE POLICY "Assets are viewable by authenticated users"
ON public.assets
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert assets"
ON public.assets
FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update assets"
ON public.assets
FOR UPDATE 
USING (public.is_admin())
WITH CHECK (public.is_admin());

ALTER TABLE public.venues  ADD COLUMN reference VARCHAR(50) UNIQUE; 

ALTER TABLE venues
ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Active'
CHECK (status IN ('Active', 'In Repair', 'Retired'));

CREATE OR REPLACE FUNCTION set_ticket_reference()
RETURNS TRIGGER AS $$
BEGIN
  NEW.reference := 'TKT · ' || TO_CHAR(NEW.created_at, 'YYYY') || ' · ' || TO_CHAR(NEW.id, 'FM000');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_ticket_reference
BEFORE INSERT ON tickets
FOR EACH ROW
EXECUTE FUNCTION set_ticket_reference();

CREATE OR REPLACE FUNCTION set_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
    NEW.reference := 'BKG · ' || TO_CHAR(NEW.created_at, 'YYYY') || ' · ' || TO_CHAR(NEW.id, 'FM000');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_booking_reference
BEFORE INSERT ON bookings
FOR EACH ROW 
EXECUTE FUNCTION set_booking_reference();

CREATE OR REPLACE FUNCTION set_asset_reference()
RETURNS TRIGGER AS $$
BEGIN
    NEW.reference := 'AST · ' || TO_CHAR(NEW.created_at, 'YYYY') || ' · ' || TO_CHAR(NEW.id, 'FM000');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_asset_reference
BEFORE INSERT ON assets
FOR EACH ROW 
EXECUTE FUNCTION set_asset_reference();

CREATE OR REPLACE FUNCTION set_venue_reference()
RETURNS TRIGGER AS $$
BEGIN 
    NEW.reference := 'VEN · ' || TO_CHAR(NEW.created_at, 'YYYY') || ' · ' || TO_CHAR(NEW.id, 'FM000');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_venue_reference
BEFORE INSERT ON venues
FOR EACH ROW 
EXECUTE FUNCTION set_venue_reference();

ALTER TABLE tickets
ADD COLUMN priority VARCHAR(50) NOT NULL DEFAULT 'Low'
CHECK (priority IN ('Low', 'Normal', 'Urgent'));


CREATE TABLE activity_logs (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    action_message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY

CREATE POLICY "Activity logs viewable by IT Admins only"
ON public.activity_logs
FOR SELECT 
USING (public.is_admin());

CREATE OR REPLACE FUNCTION log_ticket_activity()
RETURNS TRIGGER AS $$
DECLARE
    actor_id UUID;
    actor_name VARCHAR;
    assignee_name VARCHAR;
BEGIN 
    actor_id := COALESCE(NEW.updated_by, auth.uid());

    SELECT username INTO actor_name FROM public.users WHERE id = actor_id;

    IF TG_OP = 'INSERT' THEN 
        INSERT INTO activity_logs (action_message)
        VALUES (COALESCE(actor_name, 'Someone') || ' submitted ticket <strong>' || NEW.reference || '</strong>');
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.assignee_id IS DISTINCT FROM NEW.assignee_id AND NEW.assignee_id IS NOT NULL THEN
            SELECT username INTO assignee_name FROM public.users WHERE id = NEW.assignee_id;

            IF NEW.assignee_id = actor_id THEN 
                INSERT INTO activity_logs (action_message)
                VALUES (COALESCE(actor_name, 'Someone') || ' assigned <strong>' || NEW.reference || '</strong> to themselves');
            ELSE 
                INSERT INTO activity_logs (action_message)
                VALUES (COALESCE(actor_name, 'Someone') || ' assigned <strong>' || NEW.reference || '</strong> to ' || COALESCE(assignee_name, 'a user'));
            END IF;
        END IF;

        IF OLD.status IS DISTINCT FROM NEW.status THEN
            INSERT INTO activity_logs (action_message)
            VALUES (COALESCE(actor_name, 'Someone') || ' marked <strong>' || NEW.reference || '</strong> as ' || NEW.status);
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER ticket_activity_trigger
AFTER INSERT OR UPDATE ON tickets
FOR EACH ROW EXECUTE FUNCTION log_ticket_activity();

CREATE OR REPLACE FUNCTION log_booking_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO activity_logs (action_message)
        VALUES ('Booking <strong>' || NEW.reference || '</strong> was requested for ' || NEW.purpose);
    ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO activity_logs (action_message)
        VALUES ('Booking <strong>' || NEW.reference || '</strong> was ' || LOWER(NEW.status) || ' for ' || NEW.purpose);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER booking_activity_trigger
AFTER INSERT OR UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION log_booking_activity();

CREATE OR REPLACE FUNCTION log_asset_activity()
RETURNS TRIGGER AS $$
BEGIN 
    IF TG_OP = 'INSERT' THEN
        INSERT INTO activity_logs (action_message)
        VALUES ('Asset <strong>' || NEW.reference || '</strong> was added to inventory');
    ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO activity_logs (action_message)
        VALUES ('<strong>' || NEW.reference || '</strong> flagged under ' || LOWER(NEW.status));
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER asset_activity_trigger
AFTER INSERT OR UPDATE ON assets
FOR EACH ROW EXECUTE FUNCTION log_asset_activity();