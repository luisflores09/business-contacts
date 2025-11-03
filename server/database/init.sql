-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    department VARCHAR(100),
    position VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

-- Insert sample data
INSERT INTO contacts (name, email, phone, department, position) VALUES
    ('Jane', 'jane@example.com', '555-555-5555', 'Engineering', 'Software Engineer'),
    ('John', 'john@example.com', '555-555-5555', 'IT', 'Network Admin'),
    ('Jill', 'jill@example.com', '555-555-5555', 'Marketing', 'Marketing Manager'),
    ('Jack', 'jack@example.com', '555-555-5555', 'HR', 'HR Manager'),
    ('Joe', 'joe@example.com', '555-555-5555', 'Sales', 'Sales Manager'),
    ('Josephine', 'josephine@example.com', '555-555-5555', 'Finance', 'Finance Manager')
ON CONFLICT (email) DO NOTHING;
