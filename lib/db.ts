import mysql from 'mysql2/promise';
import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

// Core Configuration Setup & Dynamic Switcher
const MYSQL_CONFIG_FILE = path.join(process.cwd(), 'lib', 'mysql_config.json');

let realPool: mysql.Pool | null = null;
let realPgPool: pg.Pool | null = null;
let useFallback = true;
let activeConfig: any = null;
let connectionError: string | null = null;

export function getDbStatus() {
  return {
    useFallback,
    dbType: realPgPool !== null ? 'PostgreSQL' : (realPool !== null ? 'MySQL' : 'Fallback JSON'),
    mysqlConnected: realPool !== null || realPgPool !== null,
    currentConfig: activeConfig ? {
      host: activeConfig.host,
      port: activeConfig.port,
      user: activeConfig.user,
      database: activeConfig.database
    } : null,
    connectionError
  };
}

// Transparent SQL Query Translator for PostgreSQL
export function translateQueryToPostgres(sql: string, params: any[]) {
  // 1. Strip backticks
  let postgresSql = sql.replace(/`([^`]+)`/g, '$1');

  // 2. Remove MySQL specific table engine details
  postgresSql = postgresSql.replace(/\s*ENGINE\s*=\s*InnoDB(\s+DEFAULT\s+CHARSET\s*=\s*\w+)?( COLLATE\s*=\s*\w+)?/gi, '');
  postgresSql = postgresSql.replace(/DEFAULT\s+CHARSET\s*=\s*\w+/gi, '');

  // 3. PostgreSQL uses SERIAL instead of INT AUTO_INCREMENT/INTEGER AUTO_INCREMENT
  postgresSql = postgresSql.replace(/INT\s+AUTO_INCREMENT/gi, 'SERIAL');
  postgresSql = postgresSql.replace(/INTEGER\s+AUTO_INCREMENT/gi, 'SERIAL');

  // 4. Translate placeholders from ? to $1, $2, etc.
  let placeholderIndex = 1;
  let index = postgresSql.indexOf('?');
  while (index !== -1) {
    postgresSql = postgresSql.substring(0, index) + `$${placeholderIndex++}` + postgresSql.substring(index + 1);
    index = postgresSql.indexOf('?');
  }

  // 5. Append RETURNING * to INSERT queries if not already containing RETURNING
  if (postgresSql.trim().toUpperCase().startsWith('INSERT INTO') && !postgresSql.toUpperCase().includes('RETURNING')) {
    postgresSql += ' RETURNING *';
  }

  return postgresSql;
}

// Utility to parse standard URL-type connection strings
function parseConnectionString(uri: string) {
  try {
    const url = new URL(uri);
    return {
      host: url.hostname,
      port: url.port ? Number(url.port) : (url.protocol.startsWith('postgres') ? 5432 : 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, '')
    };
  } catch (err) {
    return null;
  }
}

export async function createAndSeedMysqlTables(pool: any) {
  const tableCheckQueries = [
    `CREATE TABLE IF NOT EXISTS \`Room_Types\` (
      \`type_id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`type_name\` VARCHAR(100) NOT NULL,
      \`price_per_day\` INT NOT NULL,
      \`capacity\` INT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS \`Admin\` (
      \`admin_id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`admin_name\` VARCHAR(100) NOT NULL,
      \`email\` VARCHAR(150) NOT NULL UNIQUE,
      \`password\` VARCHAR(100) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS \`Customers\` (
      \`customer_id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`customer_name\` VARCHAR(100) NOT NULL,
      \`phone\` VARCHAR(20) NOT NULL,
      \`email\` VARCHAR(150) NOT NULL UNIQUE,
      \`password\` VARCHAR(100) NOT NULL,
      \`address\` TEXT,
      \`id_proof\` VARCHAR(100)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS \`Rooms\` (
      \`room_id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`room_number\` VARCHAR(20) NOT NULL UNIQUE,
      \`type_id\` INT,
      \`status\` VARCHAR(20) DEFAULT 'Available',
      \`floor\` INT DEFAULT 1,
      FOREIGN KEY (\`type_id\`) REFERENCES \`Room_Types\`(\`type_id\`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS \`Bookings\` (
      \`booking_id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`customer_id\` INT,
      \`room_id\` INT,
      \`booking_date\` VARCHAR(30) NOT NULL,
      \`check_in\` VARCHAR(30) NOT NULL,
      \`check_out\` VARCHAR(30) NOT NULL,
      \`total_amount\` INT NOT NULL,
      \`booking_status\` VARCHAR(30) DEFAULT 'Pending',
      FOREIGN KEY (\`customer_id\`) REFERENCES \`Customers\`(\`customer_id\`) ON DELETE CASCADE,
      FOREIGN KEY (\`room_id\`) REFERENCES \`Rooms\`(\`room_id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS \`Payments\` (
      \`payment_id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`booking_id\` INT,
      \`payment_date\` VARCHAR(30) NOT NULL,
      \`amount\` INT NOT NULL,
      \`payment_method\` VARCHAR(50) NOT NULL,
      FOREIGN KEY (\`booking_id\`) REFERENCES \`Bookings\`(\`booking_id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS \`Employees\` (
      \`employee_id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`emp_name\` VARCHAR(100) NOT NULL,
      \`role\` VARCHAR(100) NOT NULL,
      \`salary\` INT NOT NULL,
      \`phone\` VARCHAR(20)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS \`Services\` (
      \`service_id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`service_name\` VARCHAR(100) NOT NULL,
      \`service_charge\` INT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  ];

  for (const q of tableCheckQueries) {
    await pool.query(q);
  }

  // Seed default admin
  const [admins]: any = await pool.query("SELECT COUNT(*) as total FROM Admin");
  if (admins && admins[0] && Number(admins[0].total) === 0) {
    await pool.query("INSERT INTO Admin (admin_name, email, password) VALUES (?, ?, ?)", [
      'Super Admin', 'admin@gmail.com', 'admin123'
    ]);
  }

  // Seed default customers
  const [customers]: any = await pool.query("SELECT COUNT(*) as total FROM Customers");
  if (customers && customers[0] && Number(customers[0].total) === 0) {
    await pool.query("INSERT INTO Customers (customer_name, phone, email, password, address, id_proof) VALUES (?, ?, ?, ?, ?, ?)", [
      'John Guest', '9876543210', 'guest@gmail.com', 'guest123', '123 Luxury Ave', 'PASSPORT123'
    ]);
  }

  // Seed default room types
  const [types]: any = await pool.query("SELECT COUNT(*) as total FROM Room_Types");
  if (types && types[0] && Number(types[0].total) === 0) {
    await pool.query(`
      INSERT INTO Room_Types (type_id, type_name, price_per_day, capacity) VALUES 
      (1, 'Standard Room', 1200, 2),
      (2, 'Deluxe Suite', 2500, 3),
      (3, 'Executive Room', 4500, 4),
      (4, 'Presidential Penthouse', 12000, 6)
    `);
  }

  // Seed default rooms
  const [rooms]: any = await pool.query("SELECT COUNT(*) as total FROM Rooms");
  if (rooms && rooms[0] && Number(rooms[0].total) === 0) {
    await pool.query(`
      INSERT INTO Rooms (room_id, room_number, type_id, status, floor) VALUES 
      (101, '101', 1, 'Available', 1),
      (102, '102', 1, 'Available', 1),
      (103, '103', 2, 'Available', 1),
      (201, '201', 2, 'Available', 2),
      (202, '202', 2, 'Available', 2),
      (301, '301', 3, 'Available', 3),
      (401, 'VIP-1', 4, 'Available', 4)
    `);
  }

  // Seed default employees
  const [employees]: any = await pool.query("SELECT COUNT(*) as total FROM Employees");
  if (employees && employees[0] && Number(employees[0].total) === 0) {
    await pool.query(`
      INSERT INTO Employees (emp_name, role, salary, phone) VALUES 
      ('Rajesh Kumar', 'Manager', 45000, '9988776655'),
      ('Anjali Sharma', 'Receptionist', 25000, '9911223344'),
      ('Chef Vikas', 'Chef', 35000, '9822334455'),
      ('Suresh Kumar', 'Housekeeping', 15000, '9844556677')
    `);
  }

  // Seed default services
  const [services]: any = await pool.query("SELECT COUNT(*) as total FROM Services");
  if (services && services[0] && Number(services[0].total) === 0) {
    await pool.query(`
      INSERT INTO Services (service_name, service_charge) VALUES 
      ('Gourmet In-Room Dining', 500),
      ('Premium Spa Therapy', 1500),
      ('Express Dry Cleaning & Laundry', 350),
      ('Executive Airport Lounge Shuttle', 800)
    `);
  }
}

export async function initializeMySQL(config: any) {
  try {
    let isPostgres = false;
    let connectionString = "";

    // Inspect if host/config acts as a postgres connection string or config
    if (typeof config === 'string') {
      if (config.startsWith('postgres://') || config.startsWith('postgresql://')) {
        isPostgres = true;
        connectionString = config;
      }
    } else if (config && config.host) {
      const hostStr = String(config.host).trim();
      if (hostStr.startsWith('postgres://') || hostStr.startsWith('postgresql://')) {
        isPostgres = true;
        connectionString = hostStr;
      }
    }

    if (isPostgres) {
      console.log("Configuring PostgreSQL dynamic client pool targeting Supabase/relational database...");
      // Initialize Postgres Pool
      const testPool = new Pool({
        connectionString,
        ssl: connectionString.includes('supabase.co') ? { rejectUnauthorized: false } : undefined
      });

      // Test general query
      await testPool.query("SELECT 1");

      console.log("PostgreSQL relational connection verified! Provisioning database...");

      // Define PostgreSQL Seeding Adapter
      const pgAdapter = {
        query: async (sql: string, params: any[] = []) => {
          const pgSql = translateQueryToPostgres(sql, params);
          const res = await testPool.query(pgSql, params);

          // Return result matching [rows, fields]
          if (pgSql.trim().toUpperCase().startsWith('INSERT INTO')) {
            const insertedRow = res.rows[0];
            let insertId = 0;
            if (insertedRow) {
              const keys = Object.keys(insertedRow);
              if (keys.length > 0) {
                insertId = Number(insertedRow[keys[0]]);
              }
            }
            return [{ insertId, affectedRows: res.rowCount }, findFirstPrimaryKeyColumn(pgSql)];
          }

          return [res.rows, res.fields || []];
        }
      };

      await createAndSeedMysqlTables(pgAdapter);

      // Now reset all serial sequences in PostgreSQL to ensure the maximum seed IDs are respected
      const tablesAndKeys = [
        { table: 'room_types', key: 'type_id' },
        { table: 'admin', key: 'admin_id' },
        { table: 'customers', key: 'customer_id' },
        { table: 'rooms', key: 'room_id' },
        { table: 'bookings', key: 'booking_id' },
        { table: 'payments', key: 'payment_id' },
        { table: 'employees', key: 'employee_id' },
        { table: 'services', key: 'service_id' }
      ];

      for (const { table, key } of tablesAndKeys) {
        try {
          await testPool.query(`SELECT setval(pg_get_serial_sequence('${table}', '${key}'), COALESCE(max(${key}), 1)) FROM ${table}`);
        } catch (seqErr: any) {
          console.warn(`Could not sync primary sequence for table "${table}.${key}":`, seqErr.message);
        }
      }

      // Write config to registry file
      try {
        const configWithFile = path.dirname(MYSQL_CONFIG_FILE);
        if (!fs.existsSync(configWithFile)) {
          fs.mkdirSync(configWithFile, { recursive: true });
        }
        fs.writeFileSync(MYSQL_CONFIG_FILE, JSON.stringify({ host: connectionString, isPostgres: true }, null, 2), "utf8");
      } catch (fsErr) {
        console.error("Could not archive registry postgres credentials:", fsErr);
      }

      if (realPgPool) {
        await realPgPool.end().catch(() => {});
      }
      if (realPool) {
        await realPool.end().catch(() => {});
      }

      realPgPool = testPool;
      realPool = null;
      useFallback = false;
      
      const parsed = parseConnectionString(connectionString);
      activeConfig = parsed ? {
        host: parsed.host,
        port: parsed.port,
        user: parsed.user,
        database: parsed.database
      } : {
        host: "Supabase Relational host",
        port: 5432,
        user: "postgres",
        database: "postgres"
      };
      
      connectionError = null;
      return { success: true, message: "Supabase PostgreSQL Connected & Seeded Successfully!" };
    } else {
      // Initialize Standard MySQL client
      const testPool = mysql.createPool({
        ...config,
        waitForConnections: true,
        connectionLimit: 5,
        queueLimit: 0
      });

      // Test query to verify connection
      await testPool.query("SELECT 1");

      console.log(`Connection to MySQL database ${config.database} on ${config.host} established successfully.`);
      await createAndSeedMysqlTables(testPool);

      // Archive credentials file
      try {
        const configWithFile = path.dirname(MYSQL_CONFIG_FILE);
        if (!fs.existsSync(configWithFile)) {
          fs.mkdirSync(configWithFile, { recursive: true });
        }
        fs.writeFileSync(MYSQL_CONFIG_FILE, JSON.stringify(config, null, 2), "utf8");
      } catch (fsErr) {
        console.error("Could not write mysql config file to lib/mysql_config.json:", fsErr);
      }

      if (realPool) {
        await realPool.end().catch(() => {});
      }
      if (realPgPool) {
        await realPgPool.end().catch(() => {});
      }

      realPool = testPool;
      realPgPool = null;
      useFallback = false;
      activeConfig = config;
      connectionError = null;

      return { success: true, message: "MySQL Connected & Tables Seeded Successfully!" };
    }
  } catch (err: any) {
    console.error("Database connection initialization failed:", err);
    connectionError = err.message || JSON.stringify(err);
    return { success: false, error: err.message || "Failed to establish a valid database connection." };
  }
}

// Find primary key helper from SQL instruction
function findFirstPrimaryKeyColumn(sql: string): any[] {
  // Purely to structure type matching if required
  return [];
}

// Dynamic boots sequence
(async () => {
  // 1. Try saved configFile
  if (fs.existsSync(MYSQL_CONFIG_FILE)) {
    try {
      const savedConfig = JSON.parse(fs.readFileSync(MYSQL_CONFIG_FILE, 'utf8'));
      if (savedConfig && savedConfig.host) {
        const res = await initializeMySQL(savedConfig);
        if (res.success) return;
      }
    } catch (cfgErr) {
      console.warn("Could not read saved mysql config file, trying environment.", cfgErr);
    }
  }

  // 2. Try DATABASE_URL env fallback
  const DATABASE_URL = process.env.DATABASE_URL;
  if (DATABASE_URL && (DATABASE_URL.startsWith('postgres://') || DATABASE_URL.startsWith('postgresql://'))) {
    const res = await initializeMySQL({ host: DATABASE_URL });
    if (res.success) return;
  }

  // 3. Try standard MySQL env fallback
  const MYSQL_HOST = process.env.MYSQL_HOST || '0.tcp.ngrok.io';
  const ENABLE_MYSQL = process.env.ENABLE_MYSQL === 'true' || true;
  if (ENABLE_MYSQL) {
    const envConfig = {
      host: MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT) || 12345,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD !== undefined ? process.env.MYSQL_PASSWORD : 'root',
      database: process.env.MYSQL_DATABASE || 'hotel_management',
    };
    const res = await initializeMySQL(envConfig);
    if (res.success) return;
  }

  console.log("MySQL/PostgreSQL database connection bypassed or offline. Booting in local json fallback database engine.");
})();


// Fallback JSON-file database emulator
const JSON_DB_PATH = path.join(process.cwd(), 'lib', 'hotel_db.json');

// Ensure parent folder exists
const libDir = path.dirname(JSON_DB_PATH);
if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true });
}

interface DBState {
  Admin: any[];
  Customers: any[];
  Room_Types: any[];
  Rooms: any[];
  Bookings: any[];
  Payments: any[];
  Employees: any[];
  Services: any[];
}

const DEFAULT_DB_STATE: DBState = {
  Admin: [
    { admin_id: 1, admin_name: 'Super Admin', email: 'admin@gmail.com', password: 'admin123' }
  ],
  Customers: [
    { customer_id: 1, customer_name: 'John Guest', phone: '9876543210', email: 'guest@gmail.com', password: 'guest123', address: '123 Luxury Ave', id_proof: 'PASSPORT123' }
  ],
  Room_Types: [
    { type_id: 1, type_name: 'Standard Room', price_per_day: 1200, capacity: 2 },
    { type_id: 2, type_name: 'Deluxe Suite', price_per_day: 2500, capacity: 3 },
    { type_id: 3, type_name: 'Executive Room', price_per_day: 4500, capacity: 4 },
    { type_id: 4, type_name: 'Presidential Penthouse', price_per_day: 12000, capacity: 6 }
  ],
  Rooms: [
    { room_id: 101, room_number: '101', type_id: 1, status: 'Available', floor: 1 },
    { room_id: 102, room_number: '102', type_id: 1, status: 'Available', floor: 1 },
    { room_id: 103, room_number: '103', type_id: 2, status: 'Available', floor: 1 },
    { room_id: 201, room_number: '201', type_id: 2, status: 'Available', floor: 2 },
    { room_id: 202, room_number: '202', type_id: 2, status: 'Available', floor: 2 },
    { room_id: 301, room_number: '301', type_id: 3, status: 'Available', floor: 3 },
    { room_id: 401, room_number: 'VIP-1', type_id: 4, status: 'Available', floor: 4 }
  ],
  Bookings: [],
  Payments: [],
  Employees: [
    { employee_id: 1, emp_name: 'Rajesh Kumar', role: 'Manager', salary: 45000, phone: '9988776655' },
    { employee_id: 2, emp_name: 'Anjali Sharma', role: 'Receptionist', salary: 25000, phone: '9911223344' },
    { employee_id: 3, emp_name: 'Chef Vikas', role: 'Chef', salary: 35000, phone: '9822334455' },
    { employee_id: 4, emp_name: 'Suresh Kumar', role: 'Housekeeping', salary: 15000, phone: '9844556677' }
  ],
  Services: [
    { service_id: 1, service_name: 'Gourmet In-Room Dining', service_charge: 500 },
    { service_id: 2, service_name: 'Premium Spa Therapy', service_charge: 1500 },
    { service_id: 3, service_name: 'Express Dry Cleaning & Laundry', service_charge: 350 },
    { service_id: 4, service_name: 'Executive Airport Lounge Shuttle', service_charge: 800 }
  ]
};

function readLocalDB(): DBState {
  try {
    if (fs.existsSync(JSON_DB_PATH)) {
      const data = fs.readFileSync(JSON_DB_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Failed to read local DB file:", err);
  }
  writeLocalDB(DEFAULT_DB_STATE);
  return DEFAULT_DB_STATE;
}

function writeLocalDB(state: DBState) {
  try {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    console.error("Failed to write to local DB file:", err);
  }
}

// Highly reliable SQL queries parser and simulator
function simulateQuery(sql: string, params: any[]): any {
  const db = readLocalDB();
  const sqlNormalized = sql.trim().replace(/\s+/g, ' ');

  if (sqlNormalized.includes('SELECT * FROM Admin WHERE email = ? AND password = ?')) {
    const matched = db.Admin.filter(a => a.email === params[0] && a.password === params[1]);
    return [matched, []];
  }

  if (sqlNormalized.includes('SELECT * FROM Customers WHERE email = ? AND password = ?')) {
    const matched = db.Customers.filter(c => c.email === params[0] && c.password === params[1]);
    return [matched, []];
  }

  if (sqlNormalized.startsWith('INSERT INTO Customers')) {
    const newId = db.Customers.length > 0 ? Math.max(...db.Customers.map(c => c.customer_id)) + 1 : 1;
    const newCust = {
      customer_id: newId,
      customer_name: params[0],
      phone: params[1],
      email: params[2],
      password: params[3],
      address: params[4],
      id_proof: params[5]
    };
    db.Customers.push(newCust);
    writeLocalDB(db);
    return [{ insertId: newId }, []];
  }

  if (sqlNormalized === 'SELECT COUNT(*) as total FROM Rooms') {
    return [[{ total: db.Rooms.length }], []];
  }
  if (sqlNormalized === "SELECT COUNT(*) as total FROM Rooms WHERE status='Available'") {
    const count = db.Rooms.filter(r => r.status === 'Available').length;
    return [[{ total: count }], []];
  }
  if (sqlNormalized === 'SELECT COUNT(*) as total FROM Bookings') {
    return [[{ total: db.Bookings.length }], []];
  }
  if (sqlNormalized === 'SELECT COUNT(*) as total FROM Customers') {
    return [[{ total: db.Customers.length }], []];
  }
  if (sqlNormalized === 'SELECT COUNT(*) as total FROM Employees') {
    return [[{ total: db.Employees.length }], []];
  }
  if (sqlNormalized === 'SELECT COALESCE(SUM(amount),0) as total FROM Payments') {
    const total = db.Payments.reduce((sum, p) => sum + Number(p.amount), 0);
    return [[{ total }], []];
  }

  if (sqlNormalized.includes('SELECT r.*, rt.type_name, rt.price_per_day FROM Rooms r JOIN Room_Types rt ON r.type_id = rt.type_id') ||
      sqlNormalized.includes('SELECT r.*, rt.type_name, rt.price_per_day, rt.capacity FROM Rooms r JOIN Room_Types rt ON r.type_id = rt.type_id')) {
    const rooms = db.Rooms.map(r => {
      const type = db.Room_Types.find(t => t.type_id === r.type_id);
      return {
        ...r,
        type_name: type ? type.type_name : 'Unknown',
        price_per_day: type ? type.price_per_day : 0,
        capacity: type ? type.capacity : 2
      };
    });
    return [rooms, []];
  }

  if (sqlNormalized.startsWith('INSERT INTO Rooms')) {
    const newId = db.Rooms.length > 0 ? Math.max(...db.Rooms.map(r => r.room_id)) + 1 : 101;
    const newRoom = {
      room_id: newId,
      room_number: params[0],
      type_id: Number(params[1]),
      status: params[2],
      floor: Number(params[3])
    };
    db.Rooms.push(newRoom);
    writeLocalDB(db);
    return [{ success: true, insertId: newId }, []];
  }

  if (sqlNormalized.startsWith('UPDATE Rooms SET room_number=?,type_id=?,status=?,floor=?')) {
    const roomId = Number(params[4]);
    const rIdx = db.Rooms.findIndex(r => r.room_id === roomId);
    if (rIdx !== -1) {
      db.Rooms[rIdx] = {
        room_id: roomId,
        room_number: params[0],
        type_id: Number(params[1]),
        status: params[2],
        floor: Number(params[3])
      };
      writeLocalDB(db);
    }
    return [{ affectedRows: 1 }, []];
  }

  if (sqlNormalized.startsWith('UPDATE Rooms SET status=')) {
    const match = sqlNormalized.match(/UPDATE Rooms SET status='([^']+)' WHERE room_id=\?/i);
    if (match) {
      const statusValue = match[1];
      const roomId = Number(params[0]);
      const rIdx = db.Rooms.findIndex(r => r.room_id === roomId);
      if (rIdx !== -1) {
        db.Rooms[rIdx].status = statusValue;
        writeLocalDB(db);
      }
    }
    return [{ affectedRows: 1 }, []];
  }

  if (sqlNormalized.startsWith('DELETE FROM Rooms')) {
    const id = Number(params[0]);
    db.Rooms = db.Rooms.filter(r => r.room_id !== id);
    writeLocalDB(db);
    return [{ affectedRows: 1 }, []];
  }

  if (sqlNormalized === 'SELECT * FROM Room_Types') {
    return [db.Room_Types, []];
  }

  if (sqlNormalized.startsWith('INSERT INTO Room_Types')) {
    const newId = db.Room_Types.length > 0 ? Math.max(...db.Room_Types.map(t => t.type_id)) + 1 : 1;
    const newType = {
      type_id: newId,
      type_name: params[0],
      price_per_day: Number(params[1]),
      capacity: Number(params[2])
    };
    db.Room_Types.push(newType);
    writeLocalDB(db);
    return [{ insertId: newId }, []];
  }

  if (sqlNormalized.startsWith('UPDATE Room_Types')) {
    const typeId = Number(params[3]);
    const idx = db.Room_Types.findIndex(t => t.type_id === typeId);
    if (idx !== -1) {
      db.Room_Types[idx] = {
        type_id: typeId,
        type_name: params[0],
        price_per_day: Number(params[1]),
        capacity: Number(params[2])
      };
      writeLocalDB(db);
    }
    return [{ affectedRows: 1 }, []];
  }

  if (sqlNormalized.startsWith('DELETE FROM Room_Types')) {
    const id = Number(params[0]);
    db.Room_Types = db.Room_Types.filter(t => t.type_id !== id);
    writeLocalDB(db);
    return [{ affectedRows: 1 }, []];
  }

  if (sqlNormalized.includes('FROM Bookings b JOIN Customers c ON b.customer_id = c.customer_id JOIN Rooms r ON b.room_id = r.room_id') && sqlNormalized.includes('Room_Types rt')) {
    const bId = Number(params[0]);
    const b = db.Bookings.find(bk => bk.booking_id === bId);
    if (!b) return [[], []];
    const cust = db.Customers.find(cu => cu.customer_id === b.customer_id);
    const rm = db.Rooms.find(r => r.room_id === b.room_id);
    const rt = rm ? db.Room_Types.find(t => t.type_id === rm.type_id) : null;
    return [[{
      ...b,
      customer_name: cust ? cust.customer_name : 'Valued Guest',
      customer_email: cust ? cust.email : 'guest@gmail.com',
      room_number: rm ? rm.room_number : 'N/A',
      type_name: rt ? rt.type_name : 'Standard Room',
      price_per_day: rt ? rt.price_per_day : 1200
    }], []];
  }

  if (sqlNormalized.includes('FROM Bookings b JOIN Customers c ON b.customer_id = c.customer_id JOIN Rooms r ON b.room_id = r.room_id')) {
    const bookings = db.Bookings.map(b => {
      const cust = db.Customers.find(c => c.customer_id === b.customer_id);
      const rm = db.Rooms.find(r => r.room_id === b.room_id);
      return {
        ...b,
        customer_name: cust ? cust.customer_name : 'Valued Guest',
        room_number: rm ? rm.room_number : 'N/A'
      };
    }).sort((x, y) => y.booking_id - x.booking_id);
    return [bookings, []];
  }

  if (sqlNormalized.startsWith('UPDATE Bookings SET booking_status=?')) {
    const status = params[0];
    const id = Number(params[1]);
    const bIdx = db.Bookings.findIndex(b => b.booking_id === id);
    if (bIdx !== -1) {
      db.Bookings[bIdx].booking_status = status;
      if (status === 'Cancelled') {
        const roomId = db.Bookings[bIdx].room_id;
        const rmIdx = db.Rooms.findIndex(r => r.room_id === roomId);
        if (rmIdx !== -1) {
          db.Rooms[rmIdx].status = 'Available';
        }
      }
      writeLocalDB(db);
    }
    return [{ affectedRows: 1 }, []];
  }

  if (sqlNormalized.includes("SELECT room_id FROM Bookings WHERE booking_id=?")) {
    const id = Number(params[0]);
    const booking = db.Bookings.find(b => b.booking_id === id);
    return [[booking || { room_id: 0 }], []];
  }

  if (sqlNormalized === 'SELECT * FROM Services') {
    return [db.Services, []];
  }

  if (sqlNormalized.startsWith('INSERT INTO Services')) {
    const newId = db.Services.length > 0 ? Math.max(...db.Services.map(s => s.service_id)) + 1 : 1;
    const newService = {
      service_id: newId,
      service_name: params[0],
      service_charge: Number(params[1])
    };
    db.Services.push(newService);
    writeLocalDB(db);
    return [{ insertId: newId }, []];
  }

  if (sqlNormalized.startsWith('UPDATE Services')) {
    const serviceId = Number(params[2]);
    const idx = db.Services.findIndex(s => s.service_id === serviceId);
    if (idx !== -1) {
      db.Services[idx] = {
        service_id: serviceId,
        service_name: params[0],
        service_charge: Number(params[1])
      };
      writeLocalDB(db);
    }
    return [{ affectedRows: 1 }, []];
  }

  if (sqlNormalized.startsWith('DELETE FROM Services')) {
    const id = Number(params[0]);
    db.Services = db.Services.filter(s => s.service_id !== id);
    writeLocalDB(db);
    return [{ affectedRows: 1 }, []];
  }

  if (sqlNormalized === 'SELECT * FROM Employees') {
    return [db.Employees, []];
  }

  if (sqlNormalized.startsWith('INSERT INTO Employees')) {
    const newId = db.Employees.length > 0 ? Math.max(...db.Employees.map(e => e.employee_id)) + 1 : 1;
    const newEmp = {
      employee_id: newId,
      emp_name: params[0],
      role: params[1],
      salary: Number(params[2]),
      phone: params[3]
    };
    db.Employees.push(newEmp);
    writeLocalDB(db);
    return [{ insertId: newId }, []];
  }

  if (sqlNormalized.startsWith('UPDATE Employees')) {
    const empId = Number(params[4]);
    const idx = db.Employees.findIndex(e => e.employee_id === empId);
    if (idx !== -1) {
      db.Employees[idx] = {
        employee_id: empId,
        emp_name: params[0],
        role: params[1],
        salary: Number(params[2]),
        phone: params[3]
      };
      writeLocalDB(db);
    }
    return [{ affectedRows: 1 }, []];
  }

  if (sqlNormalized.startsWith('DELETE FROM Employees')) {
    const id = Number(params[0]);
    db.Employees = db.Employees.filter(e => e.employee_id !== id);
    writeLocalDB(db);
    return [{ affectedRows: 1 }, []];
  }

  if (sqlNormalized.includes('FROM Payments p JOIN Bookings b ON p.booking_id = b.booking_id JOIN Customers c ON b.customer_id = c.customer_id JOIN Rooms r ON b.room_id = r.room_id')) {
    const payments = db.Payments.map(p => {
      const b = db.Bookings.find(bk => bk.booking_id === p.booking_id);
      const cust = b ? db.Customers.find(cu => cu.customer_id === b.customer_id) : null;
      const rm = b ? db.Rooms.find(r => r.room_id === b.room_id) : null;
      return {
        ...p,
        customer_name: cust ? cust.customer_name : 'Unknown Guest',
        room_number: rm ? rm.room_number : 'N/A'
      };
    }).sort((x, y) => y.payment_id - x.payment_id);
    return [payments, []];
  }

  if (sqlNormalized.includes('FROM Bookings b JOIN Rooms r ON b.room_id = r.room_id JOIN Room_Types rt ON r.type_id = rt.type_id WHERE b.customer_id = ?')) {
    const custId = Number(params[0]);
    const bookings = db.Bookings.filter(b => b.customer_id === custId).map(b => {
      const rm = db.Rooms.find(r => r.room_id === b.room_id);
      const rt = rm ? db.Room_Types.find(t => t.type_id === rm.type_id) : null;
      return {
        ...b,
        room_number: rm ? rm.room_number : 'N/A',
        type_name: rt ? rt.type_name : 'N/A',
        price_per_day: rt ? rt.price_per_day : 0
      };
    }).sort((x, y) => y.booking_id - x.booking_id);
    return [bookings, []];
  }

  if (sqlNormalized.startsWith('INSERT INTO Bookings')) {
    const newId = db.Bookings.length > 0 ? Math.max(...db.Bookings.map(b => b.booking_id)) + 1 : 1;
    const newBooking = {
      booking_id: newId,
      customer_id: Number(params[0]),
      room_id: Number(params[1]),
      booking_date: params[2],
      check_in: params[3],
      check_out: params[4],
      total_amount: Number(params[5]),
      booking_status: 'Pending'
    };
    db.Bookings.push(newBooking);
    
    const rmIdx = db.Rooms.findIndex(r => r.room_id === Number(params[1]));
    if (rmIdx !== -1) {
      db.Rooms[rmIdx].status = 'Booked';
    }

    writeLocalDB(db);
    return [{ insertId: newId }, []];
  }

  if (sqlNormalized.includes('SELECT p.* FROM Payments p JOIN Bookings b ON p.booking_id = b.booking_id WHERE b.customer_id = ?')) {
    const custId = Number(params[0]);
    const payments = db.Payments.filter(p => {
      const b = db.Bookings.find(bk => bk.booking_id === p.booking_id);
      return b && b.customer_id === custId;
    });
    return [payments, []];
  }

  if (sqlNormalized.startsWith('INSERT INTO Payments')) {
    const newId = db.Payments.length > 0 ? Math.max(...db.Payments.map(p => p.payment_id)) + 1 : 1;
    const newPayment = {
      payment_id: newId,
      booking_id: Number(params[0]),
      payment_date: params[1],
      amount: Number(params[2]),
      payment_method: params[3]
    };
    db.Payments.push(newPayment);

    const bIdx = db.Bookings.findIndex(b => b.booking_id === newPayment.booking_id);
    if (bIdx !== -1) {
      db.Bookings[bIdx].booking_status = 'Confirmed';
    }

    writeLocalDB(db);
    return [{ insertId: newId }, []];
  }

  if (sqlNormalized === 'SELECT * FROM Customers WHERE customer_id=?') {
    const id = Number(params[0]);
    const cust = db.Customers.find(c => c.customer_id === id);
    return [[cust], []];
  }

  if (sqlNormalized.startsWith('UPDATE Customers SET customer_name=?,phone=?,email=?,address=?,id_proof=?')) {
    const id = Number(params[5]);
    const idx = db.Customers.findIndex(c => c.customer_id === id);
    if (idx !== -1) {
      db.Customers[idx] = {
        ...db.Customers[idx],
        customer_name: params[0],
        phone: params[1],
        email: params[2],
        address: params[3],
        id_proof: params[4]
      };
      writeLocalDB(db);
    }
    return [{ affectedRows: 1 }, []];
  }

  console.log("No specific emulation match for query: ", sqlNormalized);
  return [[], []];
}

const poolWrapper = {
  query: async (sql: string, params: any[] = []): Promise<any> => {
    if (!useFallback && realPgPool) {
      try {
        const pgSql = translateQueryToPostgres(sql, params);
        const res = await realPgPool.query(pgSql, params);
        
        // Return result matching [rows, fields]
        if (pgSql.trim().toUpperCase().startsWith('INSERT INTO')) {
          const insertedRow = res.rows[0];
          let insertId = 0;
          if (insertedRow) {
            const keys = Object.keys(insertedRow);
            if (keys.length > 0) {
              insertId = Number(insertedRow[keys[0]]);
            }
          }
          return [{ insertId, affectedRows: res.rowCount }, findFirstPrimaryKeyColumn(pgSql)];
        }
        
        return [res.rows, res.fields || []];
      } catch (err: any) {
        console.warn("PostgreSQL query execution failed:", err.message);
        throw err;
      }
    }
    
    if (!useFallback && realPool) {
      try {
        const [rows, fields] = await realPool.query(sql, params);
        return [rows, fields];
      } catch (err: any) {
        console.warn("MySQL pool query failed:", err.message);
        throw err;
      }
    }
    
    // Run emulation
    return simulateQuery(sql, params);
  }
};

export default poolWrapper;
