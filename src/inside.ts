import puppeteer from "puppeteer";
import { configDotenv } from "dotenv";
import CreateCohortsAndStudentsUseCase from "./usecase/CreateCohortsAndStudentsUseCase";
import { CohortRepository } from "./repositories/CohortRepository";
import { StudentRepository } from "./repositories/StudentRepository";
import { db } from "./core/database";

const envVars = configDotenv().parsed;
if (!envVars) {
  throw new Error("No environment variables found");
}

const baseUrl = envVars.INSIDE_BASE_URL;
const login = envVars.INSIDE_LOGIN;
const password = envVars.INSIDE_PASSWORD;

function delay(time: number): Promise<void> {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto(baseUrl);

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  // Type into search box
  await page.type("#user-accounts2-email--592175719", login);
  await page.type("#user-accounts2-password--1620227202", password);

  // Wait and click on first result
  const submitLoginSelector = "button[type=submit]";
  await page.waitForSelector(submitLoginSelector);
  await page.click(submitLoginSelector);

  await page.waitForNavigation();

  // Goto promos page
  await page.goto(`${baseUrl}promos`);

  await page.waitForSelector(".ag-center-cols-container");

  // Get all cohorts
  const cohorts = await page.evaluate(() => {
    const cohorts = document.querySelectorAll(
      ".ag-center-cols-container .ag-row"
    );

    return Array.from(cohorts).map((cohort) => {
      const cohortName = cohort.querySelector(
        ".ag-cell:nth-child(2) > div > div"
      )?.textContent;
      const cohortStartDate = cohort.querySelector(
        ".ag-cell:nth-child(3) > div > div"
      )?.textContent;
      const cohortEndDate = cohort.querySelector(
        ".ag-cell:nth-child(4) > div > div"
      )?.textContent;
      const nbStudents = parseInt(cohort.querySelector(
        ".ag-cell:nth-child(6) > div > div"
      )?.textContent as string);
      const cohortDetailsLink = cohort
        .querySelector(".ag-cell:nth-child(10) > div > div > a")
        ?.attributes.getNamedItem("href")?.value;
      return {
        cohortName,
        cohortStartDate,
        cohortEndDate,
        nbStudents,
        cohortDetailsLink,
        cohortId: "",
      };
    });
  });

  const useCase = new CreateCohortsAndStudentsUseCase(
    new CohortRepository(db),
    new StudentRepository(db)
  );

  //const tmpCohorts = cohorts.filter((cohort) => cohort.cohortName?.includes('NOCODE'));
  //const cohort = tmpCohorts[0];


  for(const cohort of cohorts) {
    console.log(`nombre d'étudiants : ${cohort.nbStudents}`)
    if(cohort.nbStudents > 0) {
      // Click on third cohort
      await page.goto(`${cohort.cohortDetailsLink}`, {waitUntil: "domcontentloaded"});
      const cohortId: string = await useCase.createCohort(
        cohort.cohortName ?? "",
        cohort.cohortStartDate ?? "",
        cohort.cohortEndDate ?? ""
      );

      console.log(cohort);

      // attendre le retour de la requête
      await delay(5000);

      // Get all students
      const students = await page.evaluate(async() => {
        const students = await document.querySelectorAll(
          ".ag-center-cols-container .ag-row"
        );
        if(students.length === 0) {
          return [];
        }
        return Array.from(students).map((student) => {
          const studentName = student.querySelector(
            ".ag-cell:nth-child(6) > div > div"
          )?.textContent;
          const studentGithub = student.querySelector(
            ".ag-cell:nth-child(7) > div > div"
          )?.textContent;
          const studentExit: boolean =
            student.querySelector(".ag-cell:nth-child(8) > div > div")
              ?.textContent !== "";
          return { studentName, studentGithub, studentExit };
        });
      });
      console.log(students);
      for (const student of students) {
        await useCase.createStudent(
          cohortId,
          student.studentName ?? "",
          student.studentGithub ?? "",
          "",
          student.studentExit
        );
      }
    }
  }
  await db.destroy();
  await browser.close();
})();
