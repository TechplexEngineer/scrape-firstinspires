import 'dotenv/config';
import { chromium } from 'playwright';

import {doc} from './sheets.js';


const browser = await chromium.launch({
    headless: false
});

// Creates a new browser context. It won't share cookies/cache with other browser contexts.
const context = await browser.newContext();

// const page = await browser.newPage();
const page = await context.newPage();

const teamUrl = "https://my.firstinspires.org/Teams//Wizard/TeamContacts/?TeamProfileID=1559922";

await page.goto(teamUrl);

await page.locator('input#Username').fill(process.env.FIRST_EMAIL || "");
const $pwField = page.locator('input#Password');

await $pwField.fill(process.env.FIRST_PASSWORD || "");

await Promise.all([
    page.waitForURL(teamUrl),
    await $pwField.press('Enter')
]);

const pageData = await page.evaluate(() => {
    if (! ("ContactRosterModel" in window) ) {
        return;
    }
    // @ts-ignore
    return ContactRosterModel;
});
await browser.close()

// console.log('res', JSON.stringify(pageData.TeamStudents, null, 2));

await doc.sheetsByTitle['Team Members'].clear();

const sheet = doc.sheetsByTitle['Team Members'];

await sheet.setHeaderRow(['name_first', 'name_last', 'email', 'phone',
    "parent_name_first",
    "parent_name_last",
    "parent_email",
    "parent_phone",
    "ApplicationStatus",
    "FlagAccepted",
    "FlagPending",
    "FlagDenied",
    "FlagAwardSubmitter",
    "ConsentReleaseStatus",
    "flag_applied",
]);

// freeze header row
await sheet.updateGridProperties({
    frozenRowCount: 1,
    rowCount: sheet.gridProperties.rowCount,
    columnCount: sheet.gridProperties.columnCount,
});

await sheet.addRows(pageData.TeamStudents)

