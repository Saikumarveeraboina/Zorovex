// Utility for parsing and extracting data from uploaded files

import { extname } from 'path';

/**
 * Returns basic info about an uploaded file
 */
export const parseUploadedFile = (file) => {
  if (!file) return null;

  return {
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    extension: extname(file.originalname).toLowerCase(),
    path: file.path,
    filename: file.filename,
  };
};

/**
 * Validates that an uploaded file is a PDF
 */
export const validatePDF = (file) => {
  if (!file) return { valid: false, message: 'No file uploaded.' };
  const ext = extname(file.originalname).toLowerCase();
  if (ext !== '.pdf') {
    return { valid: false, message: 'Only PDF files are allowed.' };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, message: 'File size must be under 5MB.' };
  }
  return { valid: true };
};
