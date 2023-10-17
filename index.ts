import 'dotenv/config';
import { chromium } from 'playwright';


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

const res = await page.evaluate(() => {
    if (! ("ContactRosterModel" in window) ) {
        return;
    }
    // @ts-ignore
    return ContactRosterModel.TeamStudents;
});

console.log('res', res);


await browser.close()