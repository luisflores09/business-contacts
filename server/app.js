const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const pool = require('./config/database');

// Configure CORS for production
const corsOptions = {
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected', error: error.message });
  }
});

// Database initialization endpoint (call once after deployment)
app.post('/init-db', async (req, res) => {
  try {
    // Create contacts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        department VARCHAR(100),
        position VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email)
    `);

    // Insert sample data
    await pool.query(`
      INSERT INTO contacts (name, email, phone, department, position) VALUES
        ('Jane', 'jane@example.com', '555-555-5555', 'Engineering', 'Software Engineer'),
        ('John', 'john@example.com', '555-555-5555', 'IT', 'Network Admin'),
        ('Jill', 'jill@example.com', '555-555-5555', 'Marketing', 'Marketing Manager'),
        ('Jack', 'jack@example.com', '555-555-5555', 'HR', 'HR Manager'),
        ('Joe', 'joe@example.com', '555-555-5555', 'Sales', 'Sales Manager'),
        ('Josephine', 'josephine@example.com', '555-555-5555', 'Finance', 'Finance Manager')
      ON CONFLICT (email) DO NOTHING
    `);

    res.json({ 
      success: true, 
      message: 'Database initialized successfully with sample data' 
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to initialize database', 
      details: error.message 
    });
  }
});

// Get all contacts
app.get('/contacts', async (req, res, next) => {
  console.log('📞 GET /contacts - Starting to fetch contacts...');
  try {
    console.log('🔍 Executing query to fetch contacts from database...');
    const result = await pool.query(
      'SELECT id, name, email, phone, department, position, created_at FROM contacts ORDER BY name ASC'
    );
    console.log(`✅ Query successful! Found ${result.rows.length} contacts`);
    console.log('📊 Contacts data:', JSON.stringify(result.rows, null, 2));
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching contacts:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      table: error.table,
      column: error.column
    });
    res.status(500).json({ 
      error: 'Failed to fetch contacts',
      details: error.message,
      code: error.code
    });
  }
});

// Get contact by ID
app.get('/contacts/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, name, email, phone, department, position, created_at FROM contacts WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
});

// Create new contact
app.post('/contacts', async (req, res, next) => {
  try {
    const { name, email, phone, department, position } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    const result = await pool.query(
      'INSERT INTO contacts (name, email, phone, department, position) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, phone, department, position]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating contact:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// Update contact
app.put('/contacts/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, department, position } = req.body;
    
    const result = await pool.query(
      'UPDATE contacts SET name = $1, email = $2, phone = $3, department = $4, position = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [name, email, phone, department, position, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// Delete contact
app.delete('/contacts/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM contacts WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json({ message: 'Contact deleted successfully', contact: result.rows[0] });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
})

module.exports = app;
