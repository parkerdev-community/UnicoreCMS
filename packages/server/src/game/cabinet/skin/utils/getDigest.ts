import { StorageManager } from '@common';
import * as crypto from 'crypto';

export function getDeigest(file: string): string | null {
  if (!file) return null;

  const digest = crypto.createHash('sha1');
  digest.setEncoding('hex');
  digest.write(StorageManager.read(file));
  digest.end();

  return digest.read();
}
