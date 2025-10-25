const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// File upload directory
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Allowed file types and their MIME types
const ALLOWED_TYPES = {
  pdf: 'application/pdf',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
};

// Initialize upload directory
const initializeUploadDirectory = async () => {
  try {
    await fs.access(UPLOAD_DIR);
  } catch (error) {
    // Directory doesn't exist, create it
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    console.log('✅ Created uploads directory');
  }
};

// Generate unique filename
const generateUniqueFilename = (originalName) => {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  return `pitch-${timestamp}-${randomString}${ext}`;
};

// Get file extension
const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase().replace('.', '');
};

// Validate file type
const validateFileType = (filename) => {
  const ext = getFileExtension(filename);
  return Object.keys(ALLOWED_TYPES).includes(ext);
};

// Validate file size
const validateFileSize = (fileSize) => {
  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10485760; // 10MB default
  return fileSize <= maxSize;
};

// Get file MIME type
const getMimeType = (filename) => {
  const ext = getFileExtension(filename);
  return ALLOWED_TYPES[ext] || 'application/octet-stream';
};

// Save uploaded file
const saveFile = async (file) => {
  await initializeUploadDirectory();

  // Validate file type
  if (!validateFileType(file.originalname)) {
    throw new Error(
      `Invalid file type. Allowed types: ${Object.keys(ALLOWED_TYPES).join(', ')}`
    );
  }

  // Validate file size
  if (!validateFileSize(file.size)) {
    const maxSizeMB = (parseInt(process.env.MAX_FILE_SIZE) || 10485760) / (1024 * 1024);
    throw new Error(`File too large. Maximum size: ${maxSizeMB}MB`);
  }

  // Generate unique filename
  const uniqueFilename = generateUniqueFilename(file.originalname);
  const filepath = path.join(UPLOAD_DIR, uniqueFilename);

  // Save file
  await fs.writeFile(filepath, file.buffer);

  return {
    filename: uniqueFilename,
    originalName: file.originalname,
    filepath: filepath,
    size: file.size,
    mimeType: getMimeType(file.originalname),
    uploadedAt: new Date()
  };
};

// Delete file
const deleteFile = async (filename) => {
  try {
    const filepath = path.join(UPLOAD_DIR, filename);
    await fs.access(filepath); // Check if file exists
    await fs.unlink(filepath);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Get file info
const getFileInfo = async (filename) => {
  try {
    const filepath = path.join(UPLOAD_DIR, filename);
    const stats = await fs.stat(filepath);
    
    return {
      filename,
      filepath,
      size: stats.size,
      mimeType: getMimeType(filename),
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime
    };
  } catch (error) {
    return null;
  }
};

// Check if file exists
const fileExists = async (filename) => {
  try {
    const filepath = path.join(UPLOAD_DIR, filename);
    await fs.access(filepath);
    return true;
  } catch (error) {
    return false;
  }
};

// Get file path
const getFilePath = (filename) => {
  return path.join(UPLOAD_DIR, filename);
};

// Get file URL (for serving files)
const getFileUrl = (filename, baseUrl) => {
  return `${baseUrl}/uploads/${filename}`;
};

// List all files
const listFiles = async () => {
  try {
    await initializeUploadDirectory();
    const files = await fs.readdir(UPLOAD_DIR);
    
    const fileInfos = await Promise.all(
      files.map(async (filename) => {
        const info = await getFileInfo(filename);
        return info;
      })
    );

    return fileInfos.filter(info => info !== null);
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
};

// Clean up old files (files older than specified days)
const cleanupOldFiles = async (daysOld = 30) => {
  try {
    await initializeUploadDirectory();
    const files = await fs.readdir(UPLOAD_DIR);
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    
    let deletedCount = 0;

    for (const filename of files) {
      const filepath = path.join(UPLOAD_DIR, filename);
      const stats = await fs.stat(filepath);
      
      if (stats.birthtime < cutoffDate) {
        await fs.unlink(filepath);
        deletedCount++;
      }
    }

    console.log(`Cleaned up ${deletedCount} old files`);
    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up files:', error);
    return 0;
  }
};

// Get total storage used
const getStorageUsed = async () => {
  try {
    await initializeUploadDirectory();
    const files = await fs.readdir(UPLOAD_DIR);
    
    let totalSize = 0;
    for (const filename of files) {
      const filepath = path.join(UPLOAD_DIR, filename);
      const stats = await fs.stat(filepath);
      totalSize += stats.size;
    }

    return {
      bytes: totalSize,
      kilobytes: (totalSize / 1024).toFixed(2),
      megabytes: (totalSize / (1024 * 1024)).toFixed(2),
      gigabytes: (totalSize / (1024 * 1024 * 1024)).toFixed(2),
      fileCount: files.length
    };
  } catch (error) {
    console.error('Error calculating storage:', error);
    return null;
  }
};

// Validate file before upload (use in middleware)
const validateUpload = (file) => {
  const errors = [];

  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors };
  }

  if (!validateFileType(file.originalname)) {
    errors.push(
      `Invalid file type. Allowed: ${Object.keys(ALLOWED_TYPES).join(', ')}`
    );
  }

  if (!validateFileSize(file.size)) {
    const maxSizeMB = (parseInt(process.env.MAX_FILE_SIZE) || 10485760) / (1024 * 1024);
    errors.push(`File too large. Maximum: ${maxSizeMB}MB`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Format file size for display
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

module.exports = {
  // Directory management
  initializeUploadDirectory,
  UPLOAD_DIR,
  
  // File operations
  saveFile,
  deleteFile,
  getFileInfo,
  fileExists,
  getFilePath,
  getFileUrl,
  listFiles,
  
  // Validation
  validateFileType,
  validateFileSize,
  validateUpload,
  getMimeType,
  
  // Utilities
  generateUniqueFilename,
  getFileExtension,
  formatFileSize,
  
  // Maintenance
  cleanupOldFiles,
  getStorageUsed,
  
  // Constants
  ALLOWED_TYPES
};