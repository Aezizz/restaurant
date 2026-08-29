// services/googleSheetsService.js
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { loadServiceAccountKey } from "../utils/fileHelpers.js";

// Gunakan named export (bukan default export)
export const exportOrdersToSheets = async (orders) => {
  try {
    console.log("📊 [EXPORT] Memulai ekspor data ke Google Sheets...");

    const creds = loadServiceAccountKey();
    if (!creds.client_email || !creds.private_key) {
      throw new Error(
        "Format file JSON service account tidak valid (missing client_email atau private_key).",
      );
    }

    const serviceAccountAuth = new JWT({
      email: creds.client_email || process.env.SERVICE_ACCOUNT_EMAIL,
      key: creds.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const spreadsheetId =
      process.env.SPREADSHEET_ID ||
      "172p1wGt4AE2SZBkO67a-E-WO77PGLX1wedVZbf3uRT0";
    if (!spreadsheetId) {
      throw new Error("SPREADSHEET_ID belum dikonfigurasi pada file .env");
    }

    console.log(`📄 [EXPORT] Mengakses Spreadsheet ID: ${spreadsheetId}`);

    const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
    await doc.loadInfo();
    console.log(`✅ [EXPORT] Berhasil membuka Spreadsheet: "${doc.title}"`);

    const sheet = doc.sheetsByIndex[0];
    if (!sheet) {
      throw new Error(
        "Sheet index 0 tidak ditemukan pada dokumen Google Sheets tersebut.",
      );
    }

    // Map data pesanan ke format baris spreadsheet
    const rows = orders.map((o) => ({
      Tanggal: new Date(o.created_at || Date.now()).toLocaleDateString("id-ID"),
      "No. Antrian": o.queue_number
        ? `#${o.queue_number.toString().padStart(3, "0")}`
        : "-",
      "No. Meja": o.table_number || "-",
      Total: o.total_price || 0,
    }));

    await sheet.addRows(rows);
    console.log(
      `🎉 [EXPORT] Sukses menambahkan ${rows.length} baris pesanan ke Google Sheets!`,
    );

    return {
      success: true,
      message: `Rekap ${rows.length} pesanan berhasil dikirim ke Google Sheets! 📊`,
      count: rows.length,
    };
  } catch (error) {
    console.error(
      "🔥 [EXPORT ERROR] Detail Kegagalan Export Google Sheets:",
      error,
    );
    throw error;
  }
};
