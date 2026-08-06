-- Initial seed data for Patients
INSERT INTO patients (name, age, gender, email, phone, created_at, updated_at)
VALUES 
    ('John Doe', 45, 'Male', 'john.doe@example.com', '+1234567890', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Jane Smith', 32, 'Female', 'jane.smith@example.com', '+1987654321', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;
