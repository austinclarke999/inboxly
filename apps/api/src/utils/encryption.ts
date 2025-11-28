import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

/**
 * Get encryption key from environment or generate one
 */
function getKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
        throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    return Buffer.from(key, 'hex');
}

/**
 * Encrypt sensitive data (like OAuth tokens)
 */
export function encrypt(text: string): string {
    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([
        cipher.update(text, 'utf8'),
        cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    return Buffer.concat([salt, iv, tag, encrypted]).toString('hex');
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedData: string): string {
    const key = getKey();
    const stringValue = Buffer.from(encryptedData, 'hex');

    const salt = stringValue.slice(0, SALT_LENGTH);
    const iv = stringValue.slice(SALT_LENGTH, TAG_POSITION);
    const tag = stringValue.slice(TAG_POSITION, ENCRYPTED_POSITION);
    const encrypted = stringValue.slice(ENCRYPTED_POSITION);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    return decipher.update(encrypted) + decipher.final('utf8');
}

/**
 * Generate a random encryption key (for setup)
 */
export function generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
}
