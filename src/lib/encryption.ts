import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'fallback-key-for-development';

export class EncryptionService {
  /**
   * Encrypt sensitive data like API keys and private keys
   */
  static encrypt(text: string): string {
    if (!text) return '';
    
    try {
      const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(encryptedText: string): string {
    if (!encryptedText) return '';
    
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) {
        throw new Error('Invalid encrypted data or wrong key');
      }
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Hash sensitive data for comparison (one-way)
   */
  static hash(text: string): string {
    return CryptoJS.SHA256(text).toString();
  }

  /**
   * Generate a secure random key
   */
  static generateKey(): string {
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }

  /**
   * Validate if a string is likely encrypted
   */
  static isEncrypted(text: string): boolean {
    try {
      // Try to decrypt - if it fails, it's probably not encrypted
      this.decrypt(text);
      return true;
    } catch {
      return false;
    }
  }
}

export default EncryptionService;
