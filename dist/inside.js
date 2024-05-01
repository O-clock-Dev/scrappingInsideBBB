"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const dotenv_1 = require("dotenv");
const envVars = (0, dotenv_1.configDotenv)().parsed;
if (!envVars) {
    throw new Error('No environment variables found');
}
const baseUrl = envVars.INSIDE_BASE_URL;
const login = envVars.INSIDE_LOGIN;
const password = envVars.INSIDE_PASSWORD;
function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}
(async () => {
    // Launch the browser and open a new blank page
    const browser = await puppeteer_1.default.launch({
        headless: false,
        defaultViewport: null,
    });
    const page = await browser.newPage();
    // Navigate the page to a URL
    await page.goto(baseUrl);
    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });
    // Type into search box
    await page.type('#user-accounts2-email--592175719', login);
    await page.type('#user-accounts2-password--1620227202', password);
    // Wait and click on first result
    const submitLoginSelector = 'button[type=submit]';
    await page.waitForSelector(submitLoginSelector);
    await page.click(submitLoginSelector);
    await page.waitForNavigation();
    // Goto promos page
    await page.goto(`${baseUrl}promos`);
    await page.waitForSelector('.ag-center-cols-container');
    // Get all cohorts
    const cohorts = await page.evaluate(() => {
        const cohorts = document.querySelectorAll('.ag-center-cols-container .ag-row');
        return Array.from(cohorts).map(cohort => {
            const cohortName = cohort.querySelector('.ag-cell:nth-child(2) > div > div')?.textContent;
            const cohortStartDate = cohort.querySelector('.ag-cell:nth-child(3) > div > div')?.textContent;
            const cohortEndDate = cohort.querySelector('.ag-cell:nth-child(4) > div > div')?.textContent;
            const cohortDetailsLink = cohort.querySelector('.ag-cell:nth-child(10) > div > div > a')?.attributes.getNamedItem('href')?.value;
            return { cohortName, cohortStartDate, cohortEndDate, cohortDetailsLink };
        });
    });
    // Click on third cohort
    await page.goto(`${cohorts[3].cohortDetailsLink}`);
    await page.waitForSelector('.ag-center-cols-container');
    // Get all students
    const students = await page.evaluate(() => {
        const students = document.querySelectorAll('.ag-center-cols-container .ag-row');
        return Array.from(students).map(student => {
            const studentName = student.querySelector('.ag-cell:nth-child(6) > div > div')?.textContent;
            const studentGithub = student.querySelector('.ag-cell:nth-child(7) > div > div')?.textContent;
            const studentExit = student.querySelector('.ag-cell:nth-child(8) > div > div')?.textContent !== '';
            return { studentName, studentGithub, studentExit };
        });
    });
    console.log(students);
    await browser.close();
})();
//# sourceMappingURL=inside.js.map