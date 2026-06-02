import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

export function verifyNCBAHash(payload: any): boolean {
  const secretKey = process.env.NCBA_SECRET_KEY;

  // Extract fields exactly in the structural order specified by NCBA's algorithm
  const {
    TransType,
    TransID,
    TransTime,
    TransAmount,
    BusinessShortCode,
    BillRefNumber,
    Mobile,
    name,
    Hash,
  } = payload;

  // Concatenate parameters sequentially matching the bank's signature layout
  // Format: secretKey + TransType + TransID + TransactionTime + TransAmount + CreditAccount + BillRefNumber + Mobile + Name + "1"
  const hashString = `${secretKey}${TransType}${TransID}${TransTime}${TransAmount}${BusinessShortCode}${BillRefNumber}${Mobile}${name}1`;

  // Compute SHA256 hex string [cite: 57, 67]
  const sha256hex = crypto
    .createHash("sha256")
    .update(hashString, "utf8")
    .digest("hex");

  // Convert hex output string into Base64 [cite: 57, 68]
  const computedHash = Buffer.from(sha256hex).toString("base64");

  // Verify match [cite: 33]
  return computedHash === Hash;
}
