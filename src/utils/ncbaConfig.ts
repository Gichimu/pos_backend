import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// export function verifyNCBAHash(payload: any, secretKey: string): boolean {
//   // Extract fields exactly in the structural order specified by NCBA's algorithm
//   const {
//     TransType,
//     TransID,
//     TransTime,
//     TransAmount,
//     BusinessShortCode,
//     BillRefNumber,
//     Mobile,
//     name,
//     created_at,
//     Username,
//     Password,
//     Hash,
//   } = payload;

//   // Concatenate parameters sequentially matching the bank's signature layout
//   // Format: secretKey + TransType + TransID + TransactionTime + TransAmount + CreditAccount + BillRefNumber + Mobile + Name + "1"
//   const hashString = `${secretKey}${TransType}${TransID}${TransTime}${TransAmount}${BusinessShortCode}${BillRefNumber}${Mobile}${name}1`;

//   // Compute SHA256 hex string
//   const sha256hex = crypto
//     .createHash("sha256")
//     .update(hashString, "utf8")
//     .digest("hex");

//   // Convert hex output string into Base64 as per NCBA's specification
//   const computedHash = Buffer.from(sha256hex).toString("base64");

//   console.log("Computed Hash:", computedHash);
//   console.log("Received Hash:", Hash);

//   // Verify match
//   return computedHash === Hash;
// }

export async function verifyNCBAHash(
  payload: any,
  secretKey: string,
): Promise<boolean> {
  const encorder = new TextEncoder();

  // const hashString =
  //   secretKey +
  //   (payload.TransType || "") +
  //   (payload.TransID || "") +
  //   (payload.TransTime || "") +
  //   (payload.TransAmount || "") +
  //   (payload.BusinessShortCode || payload.AccountNr || "") +
  //   (payload.BillRefNumber || payload.Narrative || "") +
  //   (payload.Mobile || payload.PhoneNr || "") +
  //   (payload.name || payload.CustomerName || "") +
  //   "1";
  const {
    TransType,
    TransID,
    TransTime,
    TransAmount,
    BusinessShortCode,
    BillRefNumber,
    Mobile,
    name,
    created_at,
    Username,
    Password,
    Hash,
  } = payload;

  // Concatenate parameters sequentially matching the bank's signature layout
  // Format: secretKey + TransType + TransID + TransactionTime + TransAmount + CreditAccount + BillRefNumber + Mobile + Name + "1"
  const hashString = `${secretKey}${TransType}${TransID}${TransTime}${TransAmount}${BusinessShortCode}${BillRefNumber}${Mobile}${name}1`;

  const hashBuffer = encorder.encode(hashString);
  const hashArrayBuffer = await crypto.subtle.digest("SHA-256", hashBuffer);

  const hashArray = Array.from(new Uint8Array(hashArrayBuffer));
  const sha256Hex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const computedHash = btoa(sha256Hex);

  // SHA256 -> Hex
  // const sha256Hex = crypto
  //   .createHash("sha256")
  //   .update(hashString, "utf8")
  //   .digest("hex");

  // Base64 encode hex string
  // const computedHash = Buffer.from(sha256Hex).toString("base64");

  return computedHash === payload.Hash;
}

// export async function verifyNCBAHash(
//   payload: any,
//   secretKey: string,
// ): Promise<boolean> {
//   console.log("--- NCBA RAW PAYLOAD INSPECTION ---");
//   console.log(JSON.stringify(payload, null, 2));
//   console.log("----------------------------------");

//   const TransType = payload.TransType || "";
//   const TransID = payload.TransID || "";

//   const TransactionTime = payload.TransactionTime || payload.TransTime || "";
//   const TransAmount = payload.TransAmount || "";
//   const CreditAccount =
//     payload.CreditAccount || payload.BusinessShortCode || "";
//   const BillRefNumber = payload.BillRefNumber || "";
//   const Mobile = payload.Mobile || "";
//   const Name = payload.Name || payload.name || "";

//   const ReceivedHash = payload.Hash || payload.hash || "";

//   const hashString = `${secretKey}${TransType}${TransID}${TransactionTime}${TransAmount}${CreditAccount}${BillRefNumber}${Mobile}${Name}1`;

//   console.log("Pre-image string to hash:", hashString);

//   const sha256Hex = crypto
//     .createHash("sha256")
//     .update(hashString, "utf8")
//     .digest("hex");

//   const computedHash = Buffer.from(sha256Hex, "utf8").toString("base64");

//   console.log("Computed Hash:", computedHash);
//   console.log("Received Hash:", ReceivedHash);

//   return computedHash === ReceivedHash;
// }
