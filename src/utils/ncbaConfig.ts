import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

export function verifyNCBAHash(req: any): boolean {
  const secretKey = process.env.NCBA_SECRET_KEY;

  // Extract fields exactly in the structural order specified by NCBA's algorithm
  // const {
  //   TransType,
  //   TransID,
  //   TransTime,
  //   TransAmount,
  //   BusinessShortCode,
  //   BillRefNumber,
  //   Mobile,
  //   name,
  //   Hash,
  // } = payload;
  const TransType = req.body.TransType;
  const TransID = req.body.TransID;
  const TransTime = req.body.TransTime;
  const TransAmount = req.body.TransAmount;
  const BusinessShortCode = req.body.BusinessShortCode;
  const BillRefNumber = req.body.BillRefNumber;
  const Mobile = req.body.Mobile;
  const name = req.body.name;
  const Hash = req.body.Hash;

  // Concatenate parameters sequentially matching the bank's signature layout
  // Format: secretKey + TransType + TransID + TransactionTime + TransAmount + CreditAccount + BillRefNumber + Mobile + Name + "1"
  const hashString = `${secretKey}${TransType}${TransID}${TransTime}${TransAmount}${BusinessShortCode}${BillRefNumber}${Mobile}${name}1`;

  console.log("NCBA Hash String to Compute:", hashString);

  // Compute SHA256 hex string
  const sha256hex = crypto
    .createHash("sha256")
    .update(hashString, "utf8")
    .digest("hex");

  // console.log("Computed NCBA SHA256 Hex:", sha256hex);

  // Convert hex output string into Base64 as per NCBA's specification
  const computedHash = Buffer.from(sha256hex, "utf8").toString("base64");

  // console.log("Computed NCBA Hash:", computedHash);
  // console.log("Received NCBA Hash:", Hash);

  // Verify match [cite: 33]
  return computedHash === Hash;
}
