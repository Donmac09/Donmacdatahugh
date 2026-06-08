// Parses MTN MoMo SMS messages to extract amount, transaction id, and a 6-char ref code
export interface ParsedSms {
  amount?: number;
  transactionId?: string;
  refCode?: string;
  network: "mtn";
}

export function parseMomoSms(msg: string): ParsedSms {
  const text = msg.replace(/\s+/g, " ").trim();
  const out: ParsedSms = { network: "mtn" };

  // amount: e.g. "GHS 12.00" or "received GHS12.00" or "Amount: 12.00"
  const amountMatch =
    text.match(/(?:GHS|GH₵|₵|GH\.?C|cedis?)\s*([0-9]+(?:[.,][0-9]{1,2})?)/i) ??
    text.match(/\b([0-9]+(?:[.,][0-9]{1,2})?)\s*(?:GHS|cedis?)/i) ??
    text.match(/Amount[:\s]+([0-9]+(?:[.,][0-9]{1,2})?)/i);
  if (amountMatch) out.amount = parseFloat(amountMatch[1].replace(",", "."));

  // transaction id: usually long alphanumeric. Common labels: "Transaction ID", "TxId", "Ref"
  const txMatch =
    text.match(/Transaction\s*ID[:\s]*([A-Za-z0-9.]{6,})/i) ??
    text.match(/\bTxn?\s*ID[:\s]*([A-Za-z0-9.]{6,})/i) ??
    text.match(/\bFinancial\s*Trans(?:action)?\s*Id[:\s]*([A-Za-z0-9.]{6,})/i) ??
    text.match(/\bRef(?:erence)?[:\s]*([A-Za-z0-9.]{6,})/i);
  if (txMatch) out.transactionId = txMatch[1];

  // 6-char ref code (uppercase letters/digits) — typically isolated
  const refMatches = text.match(/\b[A-Z2-9]{6}\b/g);
  if (refMatches && refMatches.length) {
    // prefer one that isn't equal to the txn id
    out.refCode = refMatches.find((r) => r !== out.transactionId) ?? refMatches[0];
  }

  return out;
}
