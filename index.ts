import 'dotenv/config';
import { chromium } from 'playwright';

import {doc} from './sheets.js';

// function returns a promise to wait for a timeout
function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


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

const teamContacts = await page.evaluate(() => {
    if (!("teamContactsModel" in window) ) {
        return;
    }
    // @ts-ignore
    return teamContactsModel;
});

// await page.pause();

// check if the roster_1 element exists using locator
const someoneToApprove = await page.isVisible('#roster_1');
if (someoneToApprove) {
    console.log('Found student to approve');
    
    await page.locator('#roster_1').getByText('Options').click();

    await page.locator('#roster_1').getByText('Approve Membership').click();

    await page.getByRole('button', { name: 'APPROVE' }).click();

    await page.locator('#roster_1').getByText('Application has been accepted!').waitFor();
} else {
    console.log('No students to approve');
}
await browser.close();

// console.log('res', JSON.stringify(pageData.TeamStudents, null, 2));



// write student data
{
    const sheet = doc.sheetsByTitle['Team Members'];
    
    await sheet.clear();

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
}

// write mentor data
{
    const sheet = doc.sheetsByTitle['Mentors'];
    
    await sheet.clear();

    await sheet.setHeaderRow(['name_first', 'name_last', 'email', 'phone',
        // "role_title",
        "RoleName",
        "ConsentReleaseStatus",
        "ypp_screening",
        "ypp_screening_status",
        // "incomplete_ypp", // 
        // "ypp_screening_text"
    ]);

    // freeze header row
    await sheet.updateGridProperties({
        frozenRowCount: 1,
        rowCount: sheet.gridProperties.rowCount,
        columnCount: sheet.gridProperties.columnCount,
    });

    await sheet.addRows(teamContacts.PeopleRoles.filter((p: any) => p.RoleName === "Mentor").map((p: any) => {
        switch (p.ypp_screening_status) {
            case "green":
                p.ypp_screening = "Complete";
                return p;
            case "orange":
                p.ypp_screening = "Not Started";
                return p;
            case "blue":
                p.ypp_screening = "Incomplete";
                return p;
            default:
                p.ypp_screening = "Unknown";
                return p;
        }
    }))
}

