const mysql = require('mysql2/promise');

let pool;

function getMysqlConfig() {
  // Supports DATABASE_URL like mysql://user:pass@host:3306/db
  const url = process.env.DATABASE_URL;
  if (url) {
    return url;
  }
  // Or discrete vars
  const host = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || 'floki';
  const port = Number(process.env.MYSQL_PORT || 3306);
  return { host, user, password, database, port, waitForConnections: true, connectionLimit: 10, queueLimit: 0 };
}

async function getPool() {
  if (!pool) {
    const cfg = getMysqlConfig();
    pool = typeof cfg === 'string' ? mysql.createPool(cfg) : mysql.createPool(cfg);
  }
  return pool;
}

async function ensureSchema() {
  const p = await getPool();
  // Create tables if not exist
  await p.query(`CREATE TABLE IF NOT EXISTS menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    image TEXT,
    category VARCHAR(64),
    type VARCHAR(64),
    ingredients TEXT,
    offer_percent DECIMAL(5,2) DEFAULT 0,
    offer_active BOOLEAN DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

  // Attempt to add missing columns for existing installations (MySQL 8+)
  await p.query('ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS category VARCHAR(64)');
  await p.query('ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS type VARCHAR(64)');
  await p.query('ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS ingredients TEXT');
  await p.query('ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS offer_percent DECIMAL(5,2) DEFAULT 0');
  await p.query('ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS offer_active BOOLEAN DEFAULT FALSE');

  await p.query(`CREATE TABLE IF NOT EXISTS tills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    till_number VARCHAR(64),
    business_name VARCHAR(255),
    active BOOLEAN DEFAULT TRUE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

  await p.query(`CREATE TABLE IF NOT EXISTS offers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discount DECIMAL(10,2) DEFAULT 0,
    valid_from DATETIME NULL,
    valid_to DATETIME NULL,
    active BOOLEAN DEFAULT TRUE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

  await p.query(`CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_name VARCHAR(255),
    client_phone VARCHAR(64),
    delivery_address VARCHAR(512),
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    total DECIMAL(10,2) DEFAULT 0,
    payment_status VARCHAR(16) NOT NULL DEFAULT 'pending',
    eta_minutes INT NULL,
    confirmed BOOLEAN DEFAULT FALSE,
    confirmed_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

  await p.query(`CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    menu_item_id INT NULL,
    quantity INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_menu FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

  // Add missing columns on existing installations
  await p.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS eta_minutes INT NULL');
  await p.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmed BOOLEAN DEFAULT FALSE');
  await p.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmed_at DATETIME NULL');
}

module.exports = { getPool, ensureSchema };
