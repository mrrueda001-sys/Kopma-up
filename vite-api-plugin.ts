import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';

const ROOT_DIR = process.cwd();
const UPLOAD_DIR = path.join(ROOT_DIR, 'public', 'uploads');
const DB_FILE = path.join(ROOT_DIR, 'data', 'database.json');
const DRIVE_SESSION_FILE = path.join(ROOT_DIR, 'data', 'drive_session.json');

// Ensure directories exist
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

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
      bankAccount: 'BCA 1234567890 a/n KOPMA'
    },
    users: [
      { username: 'admin', password: 'admin', name: 'Administrator', role: 'admin', profileImage: '' },
      { username: 'kasir', password: 'kasir', name: 'Kasir Utama', role: 'kasir', profileImage: '' }
    ],
    updatedAt: Date.now()
  };
}

function readDb(): any {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read database.json:', err);
  }
  const init = getInitialDb();
  writeDb(init);
  return init;
}

function writeDb(data: any) {
  try {
    const tmp = DB_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmp, DB_FILE);
  } catch (err) {
    console.error('Failed to write database.json:', err);
  }
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 30 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Payload gambar terlalu besar (maksimal 30 MB).'));
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', err => reject(err));
  });
}

export function posApiPlugin(): Plugin {
  const handler = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = req.url || '';

    // Set CORS headers for all requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // 1. Static Uploads serving: /uploads/<filename>
    if (req.method === 'GET' && url.startsWith('/uploads/')) {
      const parsed = url.split('?')[0];
      const filename = path.basename(parsed);
      const filePath = path.join(UPLOAD_DIR, filename);

      if (fs.existsSync(filePath)) {
        const ext = path.extname(filename).toLowerCase();
        const contentTypes: Record<string, string> = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.webp': 'image/webp',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml'
        };
        res.writeHead(200, {
          'Content-Type': contentTypes[ext] || 'application/octet-stream',
          'Cache-Control': 'public, max-age=31536000, immutable'
        });
        fs.createReadStream(filePath).pipe(res);
        return;
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'File foto tidak ditemukan.' }));
        return;
      }
    }

    // 2. Health & Status endpoint: /api/status
    if (req.method === 'GET' && url.startsWith('/api/status')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        serverTime: Date.now(),
        multiDeviceSync: true
      }));
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
        } catch (err: any) {
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

    // 3. Image Upload: POST /api/upload-image
    if (req.method === 'POST' && url.startsWith('/api/upload-image')) {
      try {
        const raw = await readBody(req);
        const payload = JSON.parse(raw);
        const imageString = payload.image || payload.dataUrl;

        if (!imageString || typeof imageString !== 'string') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Data gambar tidak valid atau kosong.' }));
          return;
        }

        // Determine mime type and pure base64
        const matches = imageString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        let mimeType = 'image/jpeg';
        let base64Data = imageString;
        let ext = 'jpg';

        if (matches && matches.length === 3) {
          mimeType = matches[1];
          base64Data = matches[2];
          if (mimeType.includes('png')) ext = 'png';
          else if (mimeType.includes('webp')) ext = 'webp';
          else if (mimeType.includes('gif')) ext = 'gif';
        }

        const buffer = Buffer.from(base64Data, 'base64');
        const safeId = String(payload.productId || 'prod')
          .replace(/[^a-zA-Z0-9_-]/g, '')
          .slice(0, 16);
        const rand = crypto.randomBytes(4).toString('hex');
        const filename = `${safeId}_${Date.now()}_${rand}.${ext}`;
        const filePath = path.join(UPLOAD_DIR, filename);

        fs.writeFileSync(filePath, buffer);

        const relativeUrl = `/uploads/${filename}`;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          url: relativeUrl,
          filename: filename,
          size: buffer.length
        }));
        return;
      } catch (err: any) {
        console.error('Error saving uploaded image:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Gagal menyimpan foto ke server: ' + (err.message || '') }));
        return;
      }
    }

    // 4. Data Sync: GET /api/sync
    if (req.method === 'GET' && url.startsWith('/api/sync')) {
      const db = readDb();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(db));
      return;
    }

    // 5. Data Sync: POST /api/sync
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
            const list: any[] = db[col];
            const idx = list.findIndex(item => String(item.id || item.username) === docId);
            if (idx > -1) {
              list[idx] = data;
            } else {
              list.unshift(data);
            }
          } else {
            db[col] = data;
          }
        } else if (payload.action === 'delete' && payload.collection) {
          const col = payload.collection;
          const docId = String(payload.id);
          if (Array.isArray(db[col])) {
            db[col] = db[col].filter((item: any) => String(item.id || item.username) !== docId);
          }
        } else {
          // Full state sync or partial merge
          ['products', 'categories', 'transactions', 'dailyArchives', 'permanentHistory', 'stockLogs', 'deletedStockLogIds', 'settings', 'users'].forEach(k => {
            if (payload[k] !== undefined) {
              db[k] = payload[k];
            }
          });
        }

        db.updatedAt = Date.now();
        writeDb(db);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          updatedAt: db.updatedAt,
          productsCount: Array.isArray(db.products) ? db.products.length : 0
        }));
        return;
      } catch (err: any) {
        console.error('Error syncing to database.json:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Gagal menyinkronkan data: ' + (err.message || '') }));
        return;
      }
    }

    next();
  };

  return {
    name: 'pos-api-plugin',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    }
  };
}
