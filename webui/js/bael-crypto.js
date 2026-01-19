/**
 * BAEL Crypto Utilities - Encryption & Hashing
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete crypto system:
 * - Hashing (SHA, MD5, HMAC)
 * - Encryption/Decryption (AES)
 * - Key generation
 * - Base64 encoding
 * - Secure random
 * - Password utilities
 */

(function () {
  "use strict";

  class BaelCrypto {
    constructor() {
      this.subtle = window.crypto?.subtle;
      this.encoder = new TextEncoder();
      this.decoder = new TextDecoder();
      console.log("🔐 Bael Crypto initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // HASHING
    // ═══════════════════════════════════════════════════════════

    // Hash with SHA-256
    async sha256(data) {
      const buffer = this.encoder.encode(data);
      const hash = await this.subtle.digest("SHA-256", buffer);
      return this.bufferToHex(hash);
    }

    // Hash with SHA-384
    async sha384(data) {
      const buffer = this.encoder.encode(data);
      const hash = await this.subtle.digest("SHA-384", buffer);
      return this.bufferToHex(hash);
    }

    // Hash with SHA-512
    async sha512(data) {
      const buffer = this.encoder.encode(data);
      const hash = await this.subtle.digest("SHA-512", buffer);
      return this.bufferToHex(hash);
    }

    // Hash with SHA-1 (not recommended for security)
    async sha1(data) {
      const buffer = this.encoder.encode(data);
      const hash = await this.subtle.digest("SHA-1", buffer);
      return this.bufferToHex(hash);
    }

    // Generic hash
    async hash(data, algorithm = "SHA-256") {
      const buffer = this.encoder.encode(data);
      const hash = await this.subtle.digest(algorithm, buffer);
      return this.bufferToHex(hash);
    }

    // Simple hash (non-crypto, fast)
    simpleHash(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(16);
    }

    // ═══════════════════════════════════════════════════════════
    // HMAC
    // ═══════════════════════════════════════════════════════════

    // HMAC-SHA256
    async hmac(message, secret, algorithm = "SHA-256") {
      const key = await this.subtle.importKey(
        "raw",
        this.encoder.encode(secret),
        { name: "HMAC", hash: algorithm },
        false,
        ["sign"],
      );

      const signature = await this.subtle.sign(
        "HMAC",
        key,
        this.encoder.encode(message),
      );

      return this.bufferToHex(signature);
    }

    // Verify HMAC
    async verifyHmac(message, secret, signature, algorithm = "SHA-256") {
      const computed = await this.hmac(message, secret, algorithm);
      return computed === signature;
    }

    // ═══════════════════════════════════════════════════════════
    // ENCRYPTION (AES-GCM)
    // ═══════════════════════════════════════════════════════════

    // Generate AES key
    async generateKey(length = 256) {
      const key = await this.subtle.generateKey(
        { name: "AES-GCM", length },
        true,
        ["encrypt", "decrypt"],
      );

      const exported = await this.subtle.exportKey("raw", key);
      return this.bufferToBase64(exported);
    }

    // Derive key from password
    async deriveKey(password, salt, iterations = 100000) {
      const keyMaterial = await this.subtle.importKey(
        "raw",
        this.encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveBits", "deriveKey"],
      );

      const key = await this.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: this.encoder.encode(salt),
          iterations,
          hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"],
      );

      return key;
    }

    // Encrypt with AES-GCM
    async encrypt(plaintext, key) {
      // Generate IV
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      // Import key if string
      let cryptoKey;
      if (typeof key === "string") {
        const keyBuffer = this.base64ToBuffer(key);
        cryptoKey = await this.subtle.importKey(
          "raw",
          keyBuffer,
          { name: "AES-GCM" },
          false,
          ["encrypt"],
        );
      } else {
        cryptoKey = key;
      }

      const encrypted = await this.subtle.encrypt(
        { name: "AES-GCM", iv },
        cryptoKey,
        this.encoder.encode(plaintext),
      );

      // Combine IV and ciphertext
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      return this.bufferToBase64(combined);
    }

    // Decrypt with AES-GCM
    async decrypt(ciphertext, key) {
      const combined = this.base64ToBuffer(ciphertext);

      // Extract IV and encrypted data
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      // Import key if string
      let cryptoKey;
      if (typeof key === "string") {
        const keyBuffer = this.base64ToBuffer(key);
        cryptoKey = await this.subtle.importKey(
          "raw",
          keyBuffer,
          { name: "AES-GCM" },
          false,
          ["decrypt"],
        );
      } else {
        cryptoKey = key;
      }

      const decrypted = await this.subtle.decrypt(
        { name: "AES-GCM", iv },
        cryptoKey,
        encrypted,
      );

      return this.decoder.decode(decrypted);
    }

    // Encrypt with password
    async encryptWithPassword(plaintext, password) {
      const salt = this.randomBytes(16);
      const key = await this.deriveKey(password, this.bufferToBase64(salt));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      const encrypted = await this.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        this.encoder.encode(plaintext),
      );

      // Combine salt + iv + ciphertext
      const combined = new Uint8Array(
        salt.length + iv.length + encrypted.byteLength,
      );
      combined.set(salt);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(encrypted), salt.length + iv.length);

      return this.bufferToBase64(combined);
    }

    // Decrypt with password
    async decryptWithPassword(ciphertext, password) {
      const combined = this.base64ToBuffer(ciphertext);

      const salt = combined.slice(0, 16);
      const iv = combined.slice(16, 28);
      const encrypted = combined.slice(28);

      const key = await this.deriveKey(password, this.bufferToBase64(salt));

      const decrypted = await this.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        encrypted,
      );

      return this.decoder.decode(decrypted);
    }

    // ═══════════════════════════════════════════════════════════
    // BASE64 ENCODING
    // ═══════════════════════════════════════════════════════════

    // Encode to Base64
    base64Encode(str) {
      return btoa(unescape(encodeURIComponent(str)));
    }

    // Decode from Base64
    base64Decode(str) {
      return decodeURIComponent(escape(atob(str)));
    }

    // URL-safe Base64 encode
    base64UrlEncode(str) {
      return this.base64Encode(str)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
    }

    // URL-safe Base64 decode
    base64UrlDecode(str) {
      let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
      while (base64.length % 4) base64 += "=";
      return this.base64Decode(base64);
    }

    // Buffer to Base64
    bufferToBase64(buffer) {
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }

    // Base64 to buffer
    base64ToBuffer(base64) {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    }

    // ═══════════════════════════════════════════════════════════
    // HEX ENCODING
    // ═══════════════════════════════════════════════════════════

    // Buffer to hex
    bufferToHex(buffer) {
      const bytes = new Uint8Array(buffer);
      return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }

    // Hex to buffer
    hexToBuffer(hex) {
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
      }
      return bytes;
    }

    // String to hex
    stringToHex(str) {
      return Array.from(str)
        .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("");
    }

    // Hex to string
    hexToString(hex) {
      let str = "";
      for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      }
      return str;
    }

    // ═══════════════════════════════════════════════════════════
    // RANDOM GENERATION
    // ═══════════════════════════════════════════════════════════

    // Random bytes
    randomBytes(length) {
      return window.crypto.getRandomValues(new Uint8Array(length));
    }

    // Random hex string
    randomHex(length = 32) {
      const bytes = this.randomBytes(Math.ceil(length / 2));
      return this.bufferToHex(bytes).slice(0, length);
    }

    // Random Base64 string
    randomBase64(length = 32) {
      const bytes = this.randomBytes(length);
      return this.bufferToBase64(bytes);
    }

    // UUID v4
    uuid() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = window.crypto.getRandomValues(new Uint8Array(1))[0] % 16;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }

    // Random string with charset
    randomString(length = 32, charset = "alphanumeric") {
      const charsets = {
        alphanumeric:
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
        alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
        numeric: "0123456789",
        hex: "0123456789abcdef",
        lowercase: "abcdefghijklmnopqrstuvwxyz",
        uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
      };

      const chars = charsets[charset] || charset;
      const bytes = this.randomBytes(length);
      let result = "";

      for (let i = 0; i < length; i++) {
        result += chars[bytes[i] % chars.length];
      }

      return result;
    }

    // ═══════════════════════════════════════════════════════════
    // PASSWORD UTILITIES
    // ═══════════════════════════════════════════════════════════

    // Generate password
    generatePassword(options = {}) {
      const {
        length = 16,
        lowercase = true,
        uppercase = true,
        numbers = true,
        symbols = true,
        excludeSimilar = true,
        excludeAmbiguous = true,
      } = options;

      let chars = "";
      let required = [];

      if (lowercase) {
        let lower = "abcdefghijklmnopqrstuvwxyz";
        if (excludeSimilar) lower = lower.replace(/[il]/g, "");
        chars += lower;
        required.push(lower[Math.floor(Math.random() * lower.length)]);
      }

      if (uppercase) {
        let upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if (excludeSimilar) upper = upper.replace(/[IO]/g, "");
        chars += upper;
        required.push(upper[Math.floor(Math.random() * upper.length)]);
      }

      if (numbers) {
        let nums = "0123456789";
        if (excludeSimilar) nums = nums.replace(/[01]/g, "");
        chars += nums;
        required.push(nums[Math.floor(Math.random() * nums.length)]);
      }

      if (symbols) {
        let syms = "!@#$%^&*()_+-=[]{}|;:,.<>?";
        if (excludeAmbiguous) syms = syms.replace(/[{}[\]()\/\\'"<>|`~]/g, "");
        chars += syms;
        required.push(syms[Math.floor(Math.random() * syms.length)]);
      }

      // Generate remaining characters
      const remaining = length - required.length;
      const bytes = this.randomBytes(remaining);

      for (let i = 0; i < remaining; i++) {
        required.push(chars[bytes[i] % chars.length]);
      }

      // Shuffle
      for (let i = required.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [required[i], required[j]] = [required[j], required[i]];
      }

      return required.join("");
    }

    // Check password strength
    passwordStrength(password) {
      let score = 0;
      const checks = {
        length8: password.length >= 8,
        length12: password.length >= 12,
        length16: password.length >= 16,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        numbers: /[0-9]/.test(password),
        symbols: /[^a-zA-Z0-9]/.test(password),
        noRepeats: !/(.)\1{2,}/.test(password),
        noSequence:
          !/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(
            password,
          ),
      };

      if (checks.length8) score += 1;
      if (checks.length12) score += 1;
      if (checks.length16) score += 1;
      if (checks.lowercase) score += 1;
      if (checks.uppercase) score += 1;
      if (checks.numbers) score += 1;
      if (checks.symbols) score += 2;
      if (checks.noRepeats) score += 1;
      if (checks.noSequence) score += 1;

      let strength;
      if (score <= 3) strength = "weak";
      else if (score <= 5) strength = "fair";
      else if (score <= 7) strength = "good";
      else if (score <= 9) strength = "strong";
      else strength = "excellent";

      return {
        score,
        strength,
        checks,
        percentage: Math.min(100, score * 10),
      };
    }

    // ═══════════════════════════════════════════════════════════
    // DIGITAL SIGNATURES
    // ═══════════════════════════════════════════════════════════

    // Generate signing key pair
    async generateSigningKeyPair() {
      const keyPair = await this.subtle.generateKey(
        {
          name: "ECDSA",
          namedCurve: "P-256",
        },
        true,
        ["sign", "verify"],
      );

      const publicKey = await this.subtle.exportKey("jwk", keyPair.publicKey);
      const privateKey = await this.subtle.exportKey("jwk", keyPair.privateKey);

      return { publicKey, privateKey };
    }

    // Sign data
    async sign(data, privateKeyJwk) {
      const privateKey = await this.subtle.importKey(
        "jwk",
        privateKeyJwk,
        { name: "ECDSA", namedCurve: "P-256" },
        false,
        ["sign"],
      );

      const signature = await this.subtle.sign(
        { name: "ECDSA", hash: "SHA-256" },
        privateKey,
        this.encoder.encode(data),
      );

      return this.bufferToBase64(signature);
    }

    // Verify signature
    async verify(data, signature, publicKeyJwk) {
      const publicKey = await this.subtle.importKey(
        "jwk",
        publicKeyJwk,
        { name: "ECDSA", namedCurve: "P-256" },
        false,
        ["verify"],
      );

      return await this.subtle.verify(
        { name: "ECDSA", hash: "SHA-256" },
        publicKey,
        this.base64ToBuffer(signature),
        this.encoder.encode(data),
      );
    }

    // ═══════════════════════════════════════════════════════════
    // CHECKSUMS
    // ═══════════════════════════════════════════════════════════

    // CRC32
    crc32(str) {
      const table = this.getCrc32Table();
      let crc = 0xffffffff;

      for (let i = 0; i < str.length; i++) {
        crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i)) & 0xff];
      }

      return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, "0");
    }

    getCrc32Table() {
      if (!this._crc32Table) {
        this._crc32Table = new Uint32Array(256);
        for (let i = 0; i < 256; i++) {
          let c = i;
          for (let j = 0; j < 8; j++) {
            c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
          }
          this._crc32Table[i] = c;
        }
      }
      return this._crc32Table;
    }

    // Adler32
    adler32(str) {
      let a = 1,
        b = 0;
      const MOD = 65521;

      for (let i = 0; i < str.length; i++) {
        a = (a + str.charCodeAt(i)) % MOD;
        b = (b + a) % MOD;
      }

      return ((b << 16) | a).toString(16).padStart(8, "0");
    }
  }

  // Initialize
  window.BaelCrypto = new BaelCrypto();

  // Global shortcuts
  window.$hash = (data, algo) => window.BaelCrypto.hash(data, algo);
  window.$encrypt = (data, key) => window.BaelCrypto.encrypt(data, key);
  window.$decrypt = (data, key) => window.BaelCrypto.decrypt(data, key);
  window.$uuid = () => window.BaelCrypto.uuid();
})();
