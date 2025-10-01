import { Item } from '@/types/index';

/**
 * Generate temporary upload path based on current date
 * Format: tmp/{YYYY}/{MM}/{DD}
 */
export function getTempUploadPath(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `tmp/${year}/${month}/${day}`;
}

/**
 * Format bytes to human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i)) + sizes[i];
}

/**
 * Generate an upload path for an item based on its creation date
 * Format: sample_items/{YYYY}/{MM}/{DD}/{id}
 */
export function getItemUploadPath(item: Item): string {
  if (item.upload_path) {
    return item.upload_path;
  }

  if (!item.id) {
    return getTempUploadPath();
  }

  const createdAt = new Date(item.created_at);
  const year = createdAt.getFullYear();
  const month = String(createdAt.getMonth() + 1).padStart(2, '0');
  const day = String(createdAt.getDate()).padStart(2, '0');

  return `sample_items/${year}/${month}/${day}/${item.id}`;
}
