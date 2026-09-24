import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, type User } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file'
];

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach(scope => provider.addScope(scope));
provider.setCustomParameters({
  prompt: 'select_account'
});

const STORAGE_KEY_TOKEN = 'pos_gdrive_access_token';
const STORAGE_KEY_USER = 'pos_gdrive_user';
const STORAGE_KEY_FOLDER = 'pos_gdrive_folder_id';
const STORAGE_KEY_MASTER_FILE = 'pos_gdrive_master_file_id';

let cachedAccessToken: string | null = localStorage.getItem(STORAGE_KEY_TOKEN);
let cachedUser: any = null;
try {
  const savedUser = localStorage.getItem(STORAGE_KEY_USER);
  if (savedUser) cachedUser = JSON.parse(savedUser);
} catch (_) {}

let cachedFolderId: string | null = localStorage.getItem(STORAGE_KEY_FOLDER);
let cachedMasterFileId: string | null = localStorage.getItem(STORAGE_KEY_MASTER_FILE);
let isSigningIn = false;

type AuthCallback = (user: any, token: string | null) => void;
const listeners: AuthCallback[] = [];

export const onDriveAuthChange = (cb: AuthCallback) => {
  listeners.push(cb);
  if (cachedUser && cachedAccessToken) {
    cb(cachedUser, cachedAccessToken);
  }
};

const notifyListeners = () => {
  listeners.forEach(cb => cb(cachedUser, cachedAccessToken));
};

// Monitor auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    cachedUser = {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL
    };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(cachedUser));
  } else {
    // If signout was not explicit, keep cached credentials unless token failed
  }
  notifyListeners();
});

export const signInWithGoogleDrive = async (): Promise<{ user: any; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses dari Google.');
    }
    cachedAccessToken = credential.accessToken;
    cachedUser = {
      uid: result.user.uid,
      displayName: result.user.displayName,
      email: result.user.email,
      photoURL: result.user.photoURL
    };

    localStorage.setItem(STORAGE_KEY_TOKEN, cachedAccessToken);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(cachedUser));

    // Bagikan sesi ke Cloud Server agar semua perangkat lain langsung otomatis terhubung
    try {
      await fetch('/api/drive-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: cachedUser,
          accessToken: cachedAccessToken,
          folderId: cachedFolderId,
          masterFileId: cachedMasterFileId
        })
      });
    } catch (_) {}

    notifyListeners();
    return { user: cachedUser, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Drive sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const signOutGoogleDrive = async () => {
  try {
    await signOut(auth);
  } catch (_) {}
  cachedAccessToken = null;
  cachedUser = null;
  cachedFolderId = null;
  cachedMasterFileId = null;
  localStorage.removeItem(STORAGE_KEY_TOKEN);
  localStorage.removeItem(STORAGE_KEY_USER);
  localStorage.removeItem(STORAGE_KEY_FOLDER);
  localStorage.removeItem(STORAGE_KEY_MASTER_FILE);

  try {
    await fetch('/api/drive-session', { method: 'DELETE' });
  } catch (_) {}

  notifyListeners();
};

export const syncDriveSessionToServer = async () => {
  if (!cachedAccessToken) return;
  try {
    await fetch('/api/drive-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: cachedUser,
        accessToken: cachedAccessToken,
        folderId: cachedFolderId,
        masterFileId: cachedMasterFileId
      })
    });
  } catch (_) {}
};

export const fetchDriveSessionFromServer = async (): Promise<boolean> => {
  try {
    const res = await fetch('/api/drive-session?_ts=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) return false;
    const data = await res.json();
    if (data && data.connected && data.accessToken) {
      cachedAccessToken = data.accessToken;
      cachedUser = data.user || null;
      if (data.folderId) cachedFolderId = data.folderId;
      if (data.masterFileId) cachedMasterFileId = data.masterFileId;
      localStorage.setItem(STORAGE_KEY_TOKEN, cachedAccessToken);
      if (cachedUser) localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(cachedUser));
      if (cachedFolderId) localStorage.setItem(STORAGE_KEY_FOLDER, cachedFolderId);
      if (cachedMasterFileId) localStorage.setItem(STORAGE_KEY_MASTER_FILE, cachedMasterFileId);
      notifyListeners();
      return true;
    }
  } catch (_) {}
  return false;
};

export const getDriveAccessToken = (): string | null => {
  return cachedAccessToken || localStorage.getItem(STORAGE_KEY_TOKEN);
};

export const getDriveUser = (): any => {
  return cachedUser;
};

export const setDriveAccessToken = (token: string | null) => {
  cachedAccessToken = token;
  if (token) {
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
  } else {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  }
  notifyListeners();
};

const FOLDER_NAME = 'Tokoku POS Cloud Backup';
const MASTER_DB_FILE_NAME = 'tokoku_pos_master_database.json';

/**
 * Mendapatkan atau membuat folder khusus 'Tokoku POS Cloud Backup' di Google Drive pengguna.
 */
export const getOrCreateDriveFolder = async (accessToken: string): Promise<string> => {
  if (cachedFolderId) {
    return cachedFolderId;
  }

  const query = encodeURIComponent(`mimeType='application/vnd.google-apps.folder' and name='${FOLDER_NAME}' and trashed=false`);
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)`;

  const res = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (res.status === 401) {
    setDriveAccessToken(null);
    throw new Error('Sesi Google Drive telah kadaluarsa. Silakan hubungkan kembali.');
  }

  if (!res.ok) {
    throw new Error('Gagal memeriksa folder di Google Drive');
  }

  const data = await res.json();
  if (data.files && data.files.length > 0) {
    cachedFolderId = data.files[0].id;
    localStorage.setItem(STORAGE_KEY_FOLDER, cachedFolderId);
    return cachedFolderId;
  }

  // Buat folder baru
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Pusat Data Terpusat Tokoku POS di Google Drive'
    })
  });

  if (!createRes.ok) {
    throw new Error('Gagal membuat folder pusat data di Google Drive');
  }

  const newFolder = await createRes.json();
  cachedFolderId = newFolder.id;
  localStorage.setItem(STORAGE_KEY_FOLDER, cachedFolderId);
  return cachedFolderId;
};

/**
 * Mencari atau membuat file Database Utama 'tokoku_pos_master_database.json' di Google Drive.
 */
export const getMasterDbFileMeta = async (accessToken: string): Promise<{ id: string; modifiedTime?: string; size?: string } | null> => {
  const folderId = await getOrCreateDriveFolder(accessToken);
  const query = encodeURIComponent(`'${folderId}' in parents and name='${MASTER_DB_FILE_NAME}' and trashed=false`);
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,size)`;

  const res = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (res.status === 401) {
    setDriveAccessToken(null);
    throw new Error('Sesi Google Drive telah kadaluarsa. Silakan login kembali.');
  }

  if (!res.ok) return null;
  const data = await res.json();
  if (data.files && data.files.length > 0) {
    cachedMasterFileId = data.files[0].id;
    localStorage.setItem(STORAGE_KEY_MASTER_FILE, cachedMasterFileId);
    return data.files[0];
  }
  return null;
};

/**
 * Mengambil database master langsung dari Google Drive.
 */
export const fetchMasterDbFromDrive = async (accessToken: string): Promise<any | null> => {
  const meta = await getMasterDbFileMeta(accessToken);
  if (!meta || !meta.id) return null;

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${meta.id}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (res.status === 401) {
    setDriveAccessToken(null);
    throw new Error('Sesi Google Drive telah kadaluarsa. Silakan login kembali.');
  }

  if (!res.ok) {
    throw new Error('Gagal mengunduh Pusat Data dari Google Drive');
  }

  const json = await res.json();
  return json;
};

/**
 * Menyimpan / memperbarui database master ke Google Drive (Single Source of Truth).
 */
export const saveMasterDbToDrive = async (accessToken: string, dbPayload: any): Promise<{ id: string; modifiedTime?: string }> => {
  const folderId = await getOrCreateDriveFolder(accessToken);
  let fileId = cachedMasterFileId;

  if (!fileId) {
    const existing = await getMasterDbFileMeta(accessToken);
    if (existing) {
      fileId = existing.id;
    }
  }

  const fileContent = JSON.stringify(dbPayload, null, 2);

  if (fileId) {
    // Update isi file yang sudah ada secara langsung
    const patchUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
    const patchRes = await fetch(patchUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: fileContent
    });

    if (patchRes.status === 401) {
      setDriveAccessToken(null);
      throw new Error('Sesi Google Drive telah kadaluarsa. Silakan login kembali.');
    }

    if (patchRes.ok) {
      return await patchRes.json();
    }

    // Jika fileId lama tidak ditemukan lagi di Google Drive (misal terhapus), kita buat baru
    if (patchRes.status === 404) {
      cachedMasterFileId = null;
      localStorage.removeItem(STORAGE_KEY_MASTER_FILE);
    } else {
      const err = await patchRes.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Gagal memperbarui Pusat Data di Google Drive');
    }
  }

  // Buat file baru jika belum ada
  const metadata = {
    name: MASTER_DB_FILE_NAME,
    parents: [folderId],
    mimeType: 'application/json',
    description: 'Pusat Data Utama Tokoku POS'
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const createRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartRequestBody
  });

  if (createRes.status === 401) {
    setDriveAccessToken(null);
    throw new Error('Sesi Google Drive telah kadaluarsa. Silakan login kembali.');
  }

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Gagal membuat file Pusat Data di Google Drive');
  }

  const result = await createRes.json();
  cachedMasterFileId = result.id;
  localStorage.setItem(STORAGE_KEY_MASTER_FILE, cachedMasterFileId);
  return result;
};

/**
 * Mengunggah salinan arsip / snapshot berkala ke folder Google Drive.
 */
export const uploadBackupSnapshotToDrive = async (
  accessToken: string,
  backupData: any,
  storeName: string = 'Tokoku'
): Promise<{ id: string; name: string; webViewLink: string; size?: string }> => {
  const folderId = await getOrCreateDriveFolder(accessToken);
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 5).replace(':', '-');
  const safeStoreName = storeName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Arsip_${safeStoreName}_${dateStr}_${timeStr}.json`;

  const metadata = {
    name: fileName,
    parents: [folderId],
    mimeType: 'application/json',
    description: `Arsip data toko ${storeName} pada ${now.toLocaleString('id-ID')}`
  };

  const fileContent = JSON.stringify(backupData, null, 2);
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,size,createdTime', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartRequestBody
  });

  if (uploadRes.status === 401) {
    setDriveAccessToken(null);
    throw new Error('Sesi Google Drive telah kadaluarsa. Silakan login kembali.');
  }

  if (!uploadRes.ok) {
    const errData = await uploadRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Gagal mengunggah arsip ke Google Drive');
  }

  return await uploadRes.json();
};

/**
 * Mengambil daftar arsip / file di Google Drive.
 */
export const listDriveBackupFiles = async (accessToken: string): Promise<any[]> => {
  const folderId = await getOrCreateDriveFolder(accessToken);
  const query = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
  const listUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=createdTime desc&fields=files(id,name,size,createdTime,modifiedTime,webViewLink,webContentLink,mimeType)`;

  const res = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (res.status === 401) {
    setDriveAccessToken(null);
    throw new Error('Sesi Google Drive telah kadaluarsa. Silakan login kembali.');
  }

  if (!res.ok) {
    throw new Error('Gagal mengambil daftar file dari Google Drive');
  }

  const data = await res.json();
  return data.files || [];
};

/**
 * Mengunduh isi file dari Google Drive.
 */
export const downloadDriveFileContent = async (accessToken: string, fileId: string): Promise<any> => {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (res.status === 401) {
    setDriveAccessToken(null);
    throw new Error('Sesi Google Drive telah kadaluarsa. Silakan login kembali.');
  }

  if (!res.ok) {
    throw new Error('Gagal mengunduh file dari Google Drive');
  }

  return await res.json();
};

/**
 * Menghapus file di Google Drive.
 */
export const deleteDriveFile = async (accessToken: string, fileId: string): Promise<boolean> => {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  return res.ok;
};

// Ekspos ke window untuk integrasi langsung dengan Alpine.js
(window as any).GoogleDriveService = {
  SCOPES,
  signIn: signInWithGoogleDrive,
  signOut: signOutGoogleDrive,
  getAccessToken: getDriveAccessToken,
  setAccessToken: setDriveAccessToken,
  getUser: getDriveUser,
  onAuthChange: onDriveAuthChange,
  getFolderId: getOrCreateDriveFolder,
  getMasterFileMeta: getMasterDbFileMeta,
  fetchMasterDb: fetchMasterDbFromDrive,
  saveMasterDb: saveMasterDbToDrive,
  uploadBackupSnapshot: uploadBackupSnapshotToDrive,
  listFiles: listDriveBackupFiles,
  downloadContent: downloadDriveFileContent,
  deleteFile: deleteDriveFile,
  syncSessionToServer: syncDriveSessionToServer,
  fetchSessionFromServer: fetchDriveSessionFromServer,
  FOLDER_NAME,
  MASTER_DB_FILE_NAME
};
