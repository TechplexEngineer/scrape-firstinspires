import 'dotenv/config';
import { JWT } from 'google-auth-library'
import { GoogleSpreadsheet } from 'google-spreadsheet';


const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
];

const jwt = new JWT({
    email: process.env.SHEETS_EMAIL,
    key: atob(process.env.SHEETS_KEY||""),
    scopes: SCOPES,
});
export const doc = new GoogleSpreadsheet(process.env.SHEET_ID || "", jwt);

await doc.loadInfo(); // loads document properties and worksheets
// console.log(doc.title);



// doc.sheetsByTitle['Team Members'].clear();

// const sheet = doc.sheetsByTitle['Team Members'];

// await sheet.setHeaderRow(['name', 'email']);


// await sheet.addRows([
//     { name: 'Sergey Brin', email: 'sergey@google.com' },
//     { name: 'Eric Schmidt', email: 'eric@google.com' },
// ]);