/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import { BoutiqueUser, UserAddress } from "./types";

interface ServerConfig {
  mailjetApiKey: string;
  mailjetApiSecret: string;
  mailjetSenderEmail: string;
  otpExpiryMinutes: number;
}

interface OTPRecord {
  email: string;
  otp: string;
  expiresAt: number;
  action: "login" | "signup";
  name?: string;
  phone?: string;
}

interface DatabaseSchema {
  users: BoutiqueUser[];
  otps: OTPRecord[];
  config: ServerConfig;
}

const DB_FILE = path.join(process.cwd(), "bloombox_db.json");

const DEFAULT_CONFIG: ServerConfig = {
  mailjetApiKey: process.env.MAILJET_API_KEY || "",
  mailjetApiSecret: process.env.MAILJET_API_SECRET || "",
  mailjetSenderEmail: process.env.MAILJET_SENDER_EMAIL || "hello@bloomandbox.com",
  otpExpiryMinutes: 5
};

function readDb(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        users: parsed.users || [],
        otps: parsed.otps || [],
        config: { ...DEFAULT_CONFIG, ...(parsed.config || {}) }
      };
    }
  } catch (err) {
    console.error("Failed to read server database, returning default fallback:", err);
  }
  return { users: [], otps: [], config: DEFAULT_CONFIG };
}

function writeDb(data: DatabaseSchema) {
  try {
    const tempFile = DB_FILE + ".tmp";
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error("Failed to write to server database:", err);
  }
}

export const ServerDb = {
  getUsers(): BoutiqueUser[] {
    return readDb().users;
  },

  getUserByEmail(email: string): BoutiqueUser | undefined {
    const e = email.toLowerCase().trim();
    return readDb().users.find((u) => u.email.toLowerCase() === e);
  },

  getUserById(id: string): BoutiqueUser | undefined {
    return readDb().users.find((u) => u.id === id);
  },

  saveUser(user: BoutiqueUser): BoutiqueUser {
    const db = readDb();
    const index = db.users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      db.users[index] = user;
    } else {
      db.users.push(user);
    }
    writeDb(db);
    return user;
  },

  // OTP Handling
  saveOTP(record: OTPRecord) {
    const db = readDb();
    // Clear old OTPs for that email to avoid clutter
    db.otps = db.otps.filter((o) => o.email.toLowerCase() !== record.email.toLowerCase());
    db.otps.push({
      ...record,
      email: record.email.toLowerCase().trim()
    });
    writeDb(db);
  },

  verifyOTP(email: string, otp: string, action: "login" | "signup"): OTPRecord | null {
    const db = readDb();
    const cleanEmail = email.toLowerCase().trim();
    const index = db.otps.findIndex(
      (o) => o.email === cleanEmail && o.otp === otp && o.action === action
    );
    
    if (index < 0) {
      return null;
    }

    const record = db.otps[index];
    // Check expiration
    if (Date.now() > record.expiresAt) {
      // Remove expired OTP
      db.otps.splice(index, 1);
      writeDb(db);
      return null;
    }

    // Clean up used OTP
    db.otps.splice(index, 1);
    writeDb(db);
    return record;
  },

  // Configurations
  getConfig(): ServerConfig {
    return readDb().config;
  },

  saveConfig(config: Partial<ServerConfig>): ServerConfig {
    const db = readDb();
    db.config = { ...db.config, ...config };
    writeDb(db);
    return db.config;
  }
};
