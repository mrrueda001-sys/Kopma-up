import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const PORT = parseInt(process.env.PORT || '3000', 10);
const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const UPLOAD_DIR = path.join(ROOT_DIR, 'public', 'uploads');
const DB_FILE = path.join(ROOT_DIR, 'data', 'database.json');
const DRIVE_SESSION_FILE = path.join(ROOT_DIR, 'data', 'drive_session.json');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(path.dirname(DB_FILE))) fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });

function getInitialDb() {
  return {
    products: [
      {
        id: 'P001',
        name: 'Air Mineral Kopma 600ml',
        barcode: '8992775211112',
        category: 'Minuman',
        buyPrice: 2200,
        sellPrice: 3500,
        stock: 75,
        unit: 'Botol',
        image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&auto=format&fit=crop&q=80'
      },
      {
        id: 'P002',
        name: 'Teh Botol Sosro Kotak 250ml',
        barcode: '8999999001234',
        category: 'Minuman',
        buyPrice: 3000,
        sellPrice: 4500,
        stock: 40,
        unit: 'Kotak',
        image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&auto=format&fit=crop&q=80'
      },
      {
        id: 'P003',
        name: 'Indomie Goreng Spesial',
        barcode: '089686010924',
        category: 'Makanan & Snack',
        buyPrice: 2800,
        sellPrice: 3500,
        stock: 50,
        unit: 'Bungkus',
        image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&auto=format&fit=crop&q=80'
      },
      {
        id: 'P004',
        name: 'Ultra Milk Cokelat 250ml',
        barcode: '8992753112001',
        category: 'Minuman',
        buyPrice: 5200,
        sellPrice: 7000,
        stock: 30,
        unit: 'Kotak',
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80'
      },
      {
        id: 'P005',
        name: 'Buku Tulis KIKY Spiral B5',
        barcode: '8992775310022',
        category: 'Alat Tulis & Kampus',
        buyPrice: 12000,
        sellPrice: 16500,
        stock: 25,
        unit: 'Buku',
        image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&auto=format&fit=crop&q=80'
      }
    ],
    categories: [
      { id: 1, name: 'Minuman' },
      { id: 2, name: 'Makanan & Snack' },
      { id: 3, name: 'Alat Tulis & Kampus' },
      { id: 4, name: 'Sembako & Kebutuhan' }
    ],
    transactions: [],
    dailyArchives: [],
    permanentHistory: [],
    stockLogs: [],
    deletedStockLogIds: [],
    settings: {
      storeName: 'KOPMA Store',
      address: 'Gedung Koperasi Mahasiswa',
      phone: '081234567890',
      receiptNote: 'Terima kasih telah berbelanja di KOPMA.',
      theme: 'emerald',
      soundEnabled: true,
      bankAccount: 'BCA 1234567890 a/n KOPMA',
      updatedAt: Date.now()
    },
    users: [
      { username: 'admin', password: 'admin', name: 'Administrator', role: 'admin', profileImage: '' },
      { username: 'kasir', password: 'kasir', name: 'Kasir Utama', role: 'kasir', profileImage: '' }
    ],
    updatedAt: Date.now()
  };
}

function readDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading DB:', e);
  }
  const init = getInitialDb();
  writeDb(init);
  return init;
}

function writeDb(data) {
  try {
    const tmp = DB_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmp, DB_FILE);
  } catch (e) {
    console.error('Error writing DB:', e);
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 30 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', err => reject(err));
  });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  const url = req.url || '/';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. Static uploads: /uploads/*
  if (req.method === 'GET' && url.startsWith('/uploads/')) {
    const filename = path.basename(url.split('?')[0]);
    const filePath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filename).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable'
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Foto tidak ditemukan' }));
    return;
  }

  // 2. Health check
  if (req.method === 'GET' && url.startsWith('/api/status')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', serverTime: Date.now(), multiDeviceSync: true }));
    return;
  }

  // 2b. Google Drive Multi-Device Shared Session
  if (url.startsWith('/api/drive-session')) {
    if (req.method === 'GET') {
      try {
        if (fs.existsSync(DRIVE_SESSION_FILE)) {
          const session = JSON.parse(fs.readFileSync(DRIVE_SESSION_FILE, 'utf-8'));
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(session));
          return;
        }
      } catch (e) {
        console.error('Error reading drive session:', e);
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ connected: false }));
      return;
    }

    if (req.method === 'POST') {
      try {
        const raw = await readBody(req);
        const payload = JSON.parse(raw);
        fs.writeFileSync(
          DRIVE_SESSION_FILE,
          JSON.stringify({ ...payload, updatedAt: Date.now(), connected: true }, null, 2)
        );
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
    }

    if (req.method === 'DELETE') {
      try {
        if (fs.existsSync(DRIVE_SESSION_FILE)) {
          fs.unlinkSync(DRIVE_SESSION_FILE);
        }
      } catch (_) {}
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, connected: false }));
      return;
    }
  }

  // 3. Upload image
  if (req.method === 'POST' && url.startsWith('/api/upload-image')) {
    try {
      const raw = await readBody(req);
      const payload = JSON.parse(raw);
      const imageString = payload.image || payload.dataUrl;
      if (!imageString) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Gambar tidak ditemukan' }));
        return;
      }
      const matches = imageString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let base64Data = imageString;
      let ext = 'jpg';
      if (matches && matches.length === 3) {
        const mime = matches[1];
        base64Data = matches[2];
        if (mime.includes('png')) ext = 'png';
        else if (mime.includes('webp')) ext = 'webp';
      }
      const buffer = Buffer.from(base64Data, 'base64');
      const safeId = String(payload.productId || 'prod').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 16);
      const rand = crypto.randomBytes(4).toString('hex');
      const filename = `${safeId}_${Date.now()}_${rand}.${ext}`;
      const filePath = path.join(UPLOAD_DIR, filename);
      fs.writeFileSync(filePath, buffer);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, url: `/uploads/${filename}`, filename, size: buffer.length }));
      return;
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  // 4. Data sync GET
  if (req.method === 'GET' && url.startsWith('/api/sync')) {
    const db = readDb();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db));
    return;
  }

  // 5. Data sync POST
  if (req.method === 'POST' && url.startsWith('/api/sync')) {
    try {
      const raw = await readBody(req);
      const payload = JSON.parse(raw);
      const db = readDb();

      if (payload.action === 'set' && payload.collection) {
        const col = payload.collection;
        const docId = String(payload.id);
        const data = payload.data;
        if (col === 'settings') {
          db.settings = { ...db.settings, ...data };
        } else if (Array.isArray(db[col])) {
          const list = db[col];
          const idx = list.findIndex(item => String(item.id || item.username) === docId);
          if (idx > -1) list[idx] = data;
          else list.unshift(data);
        } else {
          db[col] = data;
        }
      } else if (payload.action === 'delete' && payload.collection) {
        const col = payload.collection;
        const docId = String(payload.id);
        if (Array.isArray(db[col])) {
          db[col] = db[col].filter(item => String(item.id || item.username) !== docId);
        }
      } else {
        ['products', 'categories', 'transactions', 'dailyArchives', 'permanentHistory', 'stockLogs', 'deletedStockLogIds', 'settings', 'users'].forEach(k => {
          if (payload[k] !== undefined) db[k] = payload[k];
        });
      }

      db.updatedAt = Date.now();
      writeDb(db);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, updatedAt: db.updatedAt }));
      return;
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  // 6. Serve static built assets from dist
  let filePath = path.join(DIST_DIR, url === '/' ? 'index.html' : url.split('?')[0]);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/html' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
