/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { ServerDb } from "./src/dbServer";

// Lazy-loaded Gemini Client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY" || key === "") {
      console.warn("GEMINI_API_KEY is not configured or uses placeholder file name. Server-side AI will use elegant fallback mock data.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

const JWT_SECRET = process.env.JWT_SECRET || "bloombox_gilded_luxury_key_securitised";

// Authentication middleware
interface AuthenticatedRequest extends express.Request {
  user?: {
    userId: string;
    email: string;
  };
}

const authenticateToken = (req: any, res: any, next: any) => {
  let token = req.cookies?.token;
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts[0] === "Bearer" && parts[1]) {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({ error: "Session authentication required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Session expired, please login again" });
  }
};

// Mailjet OTP Sender Utility
async function sendOTPEmail(email: string, otp: string, name: string = "Patron") {
  const config = ServerDb.getConfig();
  const { mailjetApiKey, mailjetApiSecret, mailjetSenderEmail, otpExpiryMinutes } = config;

  if (!mailjetApiKey || !mailjetApiSecret) {
    console.log(`[DEVELOPER TESTING MODE] OTP Verification generated for ${email}: ${otp}. No Mailjet account configured. Handed back to browser.`);
    return { success: true, testing: true, otp };
  }

  try {
    const authString = Buffer.from(`${mailjetApiKey}:${mailjetApiSecret}`).toString("base64");
    const response = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${authString}`
      },
      body: JSON.stringify({
        Messages: [
          {
            From: {
              Email: mailjetSenderEmail,
              Name: "Bloom & Box Luxury Gifting"
            },
            To: [
              {
                Email: email,
                Name: name
              }
            ],
            Subject: `Bloom & Box Access Key: ${otp}`,
            TextPart: `Dear ${name},\n\nYour 6-digit Bloom & Box Verification Code is: ${otp}.\n\nThis OTP is valid for ${otpExpiryMinutes} minutes.\n\nWarm regards,\nBloom & Box Gifting Team`,
            HTMLPart: `
              <div style="font-family: 'Playfair Display', 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #0d0d0e; color: #f3f4f6; border: 1px solid #c5a059; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <div style="text-align: center; margin-bottom: 30px; border-bottom: 1px solid rgba(197, 160, 89, 0.2); padding-bottom: 20px;">
                  <h1 style="color: #c5a059; font-size: 28px; letter-spacing: 3px; font-weight: normal; font-family: serif; margin: 0;">BLOOM & BOX</h1>
                  <p style="color: #c5a059; font-size: 9px; font-weight: bold; letter-spacing: 5px; text-transform: uppercase; margin: 5px 0 0 0;">Luxury Gifting Suite</p>
                </div>
                
                <p style="font-size: 15px; line-height: 1.6; color: #e4e4e7;">Dear ${name},</p>
                <p style="font-size: 15px; line-height: 1.6; color: #d4d4d8;">You are receiving this safe OTP request to establish entry into your premium member account.</p>
                
                <div style="background-color: rgba(197, 160, 89, 0.05); border: 1px solid #c5a059; padding: 30px; text-align: center; border-radius: 8px; margin: 30px 0;">
                  <p style="font-size: 12px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 2px; margin-top: 0; margin-bottom: 10px;">Verification Access Key</p>
                  <h2 style="font-size: 38px; font-family: 'Courier New', monospace; font-weight: bold; letter-spacing: 8px; color: #ffffff; margin: 0; padding: 0;">${otp}</h2>
                  <p style="font-size: 11px; color: #c5a059; margin-top: 10px; margin-bottom: 0; font-family: sans-serif;">Valid for ${otpExpiryMinutes} minutes. Protect this key.</p>
                </div>
                
                <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa; margin-top: 30px;">If you did not initiate this authentication, you may securely ignore this message. Your information remains safe with us.</p>
                <p style="font-size: 14px; line-height: 1.6; color: #c5a059; margin-top: 40px; border-top: 1px solid rgba(197, 160, 89, 0.1); padding-top: 20px; font-family: sans-serif; font-style: italic;">
                  Warmest regards,<br>
                  <span style="font-weight: bold; font-style: normal; letter-spacing: 1px;">The Concierge Team</span><br>
                  Bloom & Box Luxury Gifting House
                </p>
              </div>
            `
          }
        ]
      })
    });

    const isOk = response.ok;
    if (!isOk) {
      const errorText = await response.text();
      console.error("Mailjet API Response Error:", errorText);
      throw new Error(`Mailjet connection failed: ${response.statusText}`);
    }

    return { success: true, testing: false };
  } catch (err: any) {
    console.error("Failed to route mail via Mailjet API, defaulting to console logs:", err);
    throw err;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ==========================================
  // AUTHENTICATION & SECURITY CONTROLLER ENDPOINTS
  // ==========================================

  // 1. Send OTP Code (Supports Login & Sign-up logic checks)
  app.post("/api/auth/send-otp", async (req, res) => {
    const { email, action, name, phone } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "A valid email coordinate is required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = ServerDb.getUserByEmail(cleanEmail);

    if (action === "login") {
      if (!existingUser) {
        return res.status(404).json({ error: "This email is not registered with us yet. Please create an account to begin." });
      }
    } else if (action === "signup") {
      if (existingUser) {
        return res.status(409).json({ error: "An account with this email address already exists. Please select login instead." });
      }
    } else {
      return res.status(400).json({ error: "Invalid action routing requested" });
    }

    // Generate random secure 6-digit passcode
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    const config = ServerDb.getConfig();
    const expiresAt = Date.now() + config.otpExpiryMinutes * 60 * 1000;

    // Cache to DB
    ServerDb.saveOTP({
      email: cleanEmail,
      otp: otpCode,
      expiresAt,
      action,
      name: name || "Patron",
      phone: phone || ""
    });

    try {
      const mailResponse = await sendOTPEmail(cleanEmail, otpCode, name || existingUser?.name || "Patron");
      
      const responseData: any = {
        success: true,
        message: `OTP delivered successfully to ${cleanEmail}.`
      };

      if (mailResponse.testing) {
        responseData.testing = true;
        responseData.otp = otpCode; // Backdoor delivery value so it remains 100% playable
      }

      return res.json(responseData);
    } catch (err: any) {
      return res.status(500).json({
        error: "Failed to process verification email. Please check your credentials.",
        details: err.message
      });
    }
  });

  // 2. Verify OTP Action & Establish Login / User induction
  app.post("/api/auth/verify-otp", async (req, res) => {
    const { email, otp, action } = req.body;

    if (!email || !otp || !action) {
      return res.status(400).json({ error: "Email, passcode, and original action flow must be fully declared" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const verifiedRecord = ServerDb.verifyOTP(cleanEmail, otp, action);

    if (!verifiedRecord) {
      return res.status(400).json({ error: "The entered verification code is incorrect or expired. Please request a new OTP." });
    }

    let user = ServerDb.getUserByEmail(cleanEmail);

    if (action === "signup") {
      if (user) {
        return res.status(409).json({ error: "User profile was established during verification time. Please proceed to login." });
      }
      
      // Auto-induct new user
      user = {
        id: "BB-USER-" + Math.floor(1000 + Math.random() * 9000),
        name: verifiedRecord.name || "Patron",
        email: cleanEmail,
        phone: verifiedRecord.phone || "",
        wishlist: [],
        savedAddresses: [],
        createdAt: new Date().toISOString(),
        loyaltyPoints: 500,
        redeemedCoupons: []
      };
      
      ServerDb.saveUser(user);
    } else {
      // Login flow
      if (!user) {
        return res.status(404).json({ error: "Customer profile not found. Please register first." });
      }
    }

    // Sign Auth Token
    const token = jwt.sign(
      { userId: user.id, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: "7d" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "none",
      path: "/"
    });

    return res.json({
      success: true,
      user,
      token,
      message: "Authentication established successfully"
    });
  });

  // 3. Clear Active Auth Session (Logout)
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/"
    });
    return res.json({ success: true, message: "Logged out from member dashboard" });
  });

  // 4. Retrieve Active Customer Context
  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    const user = ServerDb.getUserById(req.user.userId);
    if (!user) {
      res.clearCookie("token");
      return res.status(404).json({ error: "Authenticated session has expired or user database updated." });
    }
    if (user.loyaltyPoints === undefined) {
      user.loyaltyPoints = 500;
    }
    if (!user.redeemedCoupons) {
      user.redeemedCoupons = [];
    }
    return res.json({ success: true, user });
  });

  // 5. Update Profile Fields
  app.post("/api/auth/profile", authenticateToken, (req: any, res) => {
    const { name, phone } = req.body;
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Full Name is required" });
    }

    const user = ServerDb.getUserById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User profile was not found" });

    user.name = name;
    user.phone = phone || "";
    ServerDb.saveUser(user);

    return res.json({ success: true, user, message: "Profile coordinates updated successfully" });
  });

  // 6. Register Saved Address
  app.post("/api/auth/address", authenticateToken, (req: any, res) => {
    const { label, fullName, phone, addressLine1, addressLine2, city, state, zipCode } = req.body;

    if (!label || !fullName || !phone || !addressLine1 || !city || !state || !zipCode) {
      return res.status(400).json({ error: "Please populate all mandatory fields for secure delivery" });
    }

    const user = ServerDb.getUserById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User profile was not found" });

    const newAddress = {
      id: "ADDR-" + Math.floor(10000 + Math.random() * 89999),
      label,
      fullName,
      phone,
      addressLine1,
      addressLine2: addressLine2 || "",
      city,
      state,
      zipCode
    };

    user.savedAddresses.push(newAddress);
    ServerDb.saveUser(user);

    return res.json({ success: true, user, address: newAddress, message: "Address added successfully to saved address vault" });
  });

  // 7. Delete Saved Address
  app.delete("/api/auth/address/:addressId", authenticateToken, (req: any, res) => {
    const { addressId } = req.params;
    const user = ServerDb.getUserById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User profile was not found" });

    user.savedAddresses = user.savedAddresses.filter((addr) => addr.id !== addressId);
    ServerDb.saveUser(user);

    return res.json({ success: true, user, message: "Address deleted from vault" });
  });

  // 8. Wishlist Toggle Item Route
  app.post("/api/auth/wishlist", authenticateToken, (req: any, res) => {
    const { hamperId } = req.body;
    if (!hamperId) {
      return res.status(400).json({ error: "Hamper reference ID is expected" });
    }

    const user = ServerDb.getUserById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User profile was not found" });

    const exists = user.wishlist.includes(hamperId);
    if (exists) {
      user.wishlist = user.wishlist.filter((id) => id !== hamperId);
    } else {
      user.wishlist.push(hamperId);
    }

    ServerDb.saveUser(user);
    return res.json({ success: true, wishlist: user.wishlist, isAdded: !exists });
  });

  // ==========================================
  // LOYALTY REWARDS & REWARD COUPON SYSTEM
  // ==========================================

  // 9. Loyalty Points Retrieval & Initialization
  app.get("/api/auth/loyalty", authenticateToken, (req: any, res) => {
    const user = ServerDb.getUserById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.loyaltyPoints === undefined) {
      user.loyaltyPoints = 500;
    }
    if (!user.redeemedCoupons) {
      user.redeemedCoupons = [];
    }
    ServerDb.saveUser(user);

    return res.json({
      success: true,
      loyaltyPoints: user.loyaltyPoints,
      redeemedCoupons: user.redeemedCoupons,
      createdAt: user.createdAt
    });
  });

  // 10. Add Loyalty Points on completed actions
  app.post("/api/auth/loyalty/earn", authenticateToken, (req: any, res) => {
    const { points } = req.body;
    const user = ServerDb.getUserById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const pointsToAdd = Math.max(0, Number(points) || 0);
    user.loyaltyPoints = (user.loyaltyPoints || 500) + pointsToAdd;
    ServerDb.saveUser(user);

    return res.json({
      success: true,
      loyaltyPoints: user.loyaltyPoints,
      message: `${pointsToAdd} points successfully added for your luxury curation order!`
    });
  });

  // 11. Redeem loyalty points for customizable reward coupons
  app.post("/api/auth/loyalty/redeem", authenticateToken, (req: any, res) => {
    const { rewardType } = req.body; // "BRONZE-100" | "GOLD-250" | "DIAMOND-500"
    const user = ServerDb.getUserById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.loyaltyPoints === undefined) user.loyaltyPoints = 500;
    if (!user.redeemedCoupons) user.redeemedCoupons = [];

    let cost = 0;
    let discount = 0;
    let desc = "";

    if (rewardType === "BRONZE-100") {
      cost = 100;
      discount = 100;
      desc = "₹100 Gilded Giver Coupon Code";
    } else if (rewardType === "GOLD-250") {
      cost = 250;
      discount = 250;
      desc = "₹250 Sovereign Crown Coupon Code";
    } else if (rewardType === "DIAMOND-500") {
      cost = 400; // Special 100pt Diamond discount!
      discount = 500;
      desc = "₹500 Master Imperial Coupon Code";
    } else {
      return res.status(400).json({ error: "Invalid luxury reward tier selected" });
    }

    if (user.loyaltyPoints < cost) {
      return res.status(400).json({ error: `Insufficient loyalty balance. This reward costs ${cost} points.` });
    }

    // Generate random unique coupon suffix
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newCouponCode = `BB-REWARD-${discount}-${randomSuffix}`;

    user.loyaltyPoints -= cost;
    user.redeemedCoupons.push({
      code: newCouponCode,
      discountAmount: discount,
      pointsSpent: cost,
      createdAt: new Date().toISOString(),
      isUsed: false
    });

    ServerDb.saveUser(user);

    return res.json({
      success: true,
      user,
      coupon: {
        code: newCouponCode,
        discountAmount: discount,
        description: desc
      },
      message: `Bespoke Coupon ${newCouponCode} generated! ${cost} points deducted.`
    });
  });

  // 12. Validate/Apply coupon code in CartDrawer
  app.post("/api/auth/loyalty/apply-coupon", authenticateToken, (req: any, res) => {
    const { couponCode } = req.body;
    const user = ServerDb.getUserById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const cleanCode = String(couponCode || "").toUpperCase().trim();
    if (!cleanCode) {
      return res.status(400).json({ error: "Please enter a valid coupon code" });
    }

    if (!user.redeemedCoupons) {
      return res.status(400).json({ error: "No active coupons found in your registry" });
    }

    const coupon = user.redeemedCoupons.find((c) => c.code.toUpperCase() === cleanCode);
    if (!coupon) {
      return res.status(404).json({ error: "The entered coupon code was not found or has expired." });
    }

    if (coupon.isUsed) {
      return res.status(400).json({ error: "This luxury discount coupon has already been redeemed and applied." });
    }

    return res.json({
      success: true,
      discountAmount: coupon.discountAmount,
      message: `Coupon applied successfully! ₹${coupon.discountAmount} deducted from order.`
    });
  });

  // 13. Use coupon (finalize usage)
  app.post("/api/auth/loyalty/use-coupon", authenticateToken, (req: any, res) => {
    const { couponCode } = req.body;
    const user = ServerDb.getUserById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const cleanCode = String(couponCode || "").toUpperCase().trim();
    if (!cleanCode) return res.status(400).json({ error: "No coupon code provided" });

    if (user.redeemedCoupons) {
      const couponIndex = user.redeemedCoupons.findIndex((c) => c.code.toUpperCase() === cleanCode);
      if (couponIndex >= 0) {
        user.redeemedCoupons[couponIndex].isUsed = true;
        ServerDb.saveUser(user);
        return res.json({ success: true, message: "Coupon status updated to used." });
      }
    }
    return res.status(404).json({ error: "Coupon not found" });
  });

  // ==========================================
  // SERVER/ADMIN MAILJET CONFIG MANAGEMENT API
  // ==========================================
  app.get("/api/admin/config", (req, res) => {
    // Return config
    return res.json(ServerDb.getConfig());
  });

  app.post("/api/admin/config", (req, res) => {
    const { mailjetApiKey, mailjetApiSecret, mailjetSenderEmail, otpExpiryMinutes } = req.body;
    const updated = ServerDb.saveConfig({
      mailjetApiKey: mailjetApiKey || "",
      mailjetApiSecret: mailjetApiSecret || "",
      mailjetSenderEmail: mailjetSenderEmail || "",
      otpExpiryMinutes: Number(otpExpiryMinutes) || 5
    });
    return res.json({ success: true, config: updated, message: "Mailjet credentials updated on server database" });
  });

  // AI-Powered Gift Hamper Personalization Advisor Endpoint
  app.post("/api/ai-advisor", async (req, res) => {
    const { occasion, budget, recipient, vibe, additionalNotes } = req.body;
    
    const client = getGeminiClient();
    
    if (!client) {
      // Elegant, high-fidelity luxury mock fallback to guarantee 100% operation even with no API key
      const mockHampers: Record<string, any> = {
        Royal: {
          name: "Saffron & Indigo Dynasty Chest",
          tagline: "A majestic curation of heritage grandeur, royal gold, and timeless flavors.",
          description: `An exquisite tribute created especially for your esteemed ${recipient || "loved one"}. Wrapped in standard luxury fabrics and evoking pristine heritage notes for your ${occasion || "celebration"}.`,
          items: [
            "Premium Kashmiri export-quality saffron threads (5g)",
            "Artisanal silver-embossed brass tea infuser",
            "Single-estate Darjeeling second-flush vintage tea leaves",
            "Handmade royal cardamom-infused luxury almond brittle",
            "Organic forest wild honey in a custom stoneware jar"
          ],
          packaging: "A grand velvet-lined wooden storage chest in deep indigo, sealed with gold-leaf wax seals & cream tassels.",
          estimatedPrice: Math.min(Number(budget) || 4500, 4800)
        },
        Organic: {
          name: "Vedic Earth & Olive Hamper",
          tagline: "Pure nature, slow-crafted essentials, and authentic organic wellbeing.",
          description: `A pristine garden curation for their sacred ${occasion || "moments"}. Perfect for an organic enthusiast looking for deep grounding ingredients.`,
          items: [
            "Cold-pressed zero-waste organic extra virgin olive oil (250ml)",
            "Artisanal multi-floral wild raw honeycomb with cedar dipper",
            "Hand-spun organic linen table runner & luxury napkins",
            "Direct-trade premium roasted cocoa-dusted hazelnut clusters",
            "French lavender & eucalyptus natural soy wax candle"
          ],
          packaging: "A stunning woven wicker picnic basket lined with hand-loomed rustic cotton, bound with leather buckles.",
          estimatedPrice: Math.min(Number(budget) || 2800, 3200)
        }
      };

      const selectedVibe = (vibe === "Royal" || vibe === "Organic") ? vibe : "Royal";
      const preppedMock = mockHampers[selectedVibe] || mockHampers.Royal;
      
      // customize price based on budget slightly
      if (budget) {
        preppedMock.estimatedPrice = Math.min(Number(budget), 6500);
      }
      
      return res.json(preppedMock);
    }

    try {
      const promptText = `You are a world-class luxury gifting artisan at "Bloom & Box". Design a highly customized, ultra-premium gift hamper.
User's Gifting Occasion: ${occasion}
Recipient Type: ${recipient}
Budget target (INR): ₹${budget}
Aesthetic Preference/Vibe: ${vibe}
Special User Input & Personal Notes: ${additionalNotes || "None"}

Please return an elite, high-concept custom gift hamper recommendation incorporating products that align perfectly with their aesthetic preference. Do not suggest cheap filler materials, plastic components, or generic goods.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          systemInstruction: "You are the Lead Creative Designer and Luxury Concierge at 'Bloom & Box', a bespoke luxury gifting house. Your task is to design breathtaking custom hampers. Choose beautiful, ultra-premium items that align perfectly with the target recipient and the requested vibe. Return your response in clean JSON matching the requested schema. Ensure the estimated price is a number in Indian Rupees (INR) that fits the user's budget.",
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING", description: "Exquisite, memorable name for the bespoke hamper" },
              tagline: { type: "STRING", description: "A poetic, sensory tagline highlighting the heart of the gift" },
              description: { type: "STRING", description: "An emotional, grand editorial description detailing the layout and feel of the hamper" },
              items: {
                type: "ARRAY",
                items: { type: "STRING" },
                description: "A list of 4-6 specific premium luxury products enclosed"
              },
              packaging: { type: "STRING", description: "Design of the luxury box or basket, ribbons, and styling accents" },
              estimatedPrice: { type: "INTEGER", description: "Payable amount in Indian Rupees (INR) matching the budget" }
            },
            required: ["name", "tagline", "description", "items", "packaging", "estimatedPrice"]
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("No response string from Gemini");
      }

      const parsed = JSON.parse(text);
      res.json(parsed);

    } catch (err: any) {
      console.error("Gemini API generation error, sending graceful fallback:", err);
      res.status(500).json({
        error: "Failed to connect to the Gifting Advisor session in real-time.",
        details: err.message
      });
    }
  });

  // Serve Vite in development, static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server launched successfully at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((e) => {
  console.error("Failed to start full-stack server:", e);
});
