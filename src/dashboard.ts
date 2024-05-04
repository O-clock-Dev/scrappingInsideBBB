import puppeteer from "puppeteer"
import { configDotenv } from "dotenv"
import CreateCourseAndAffectCohort from "./usecase/CreateCoursesAndAffectCohorts"
import { CohortRepository } from "./repositories/CohortRepository.js"
import { db } from "./core/database.js"

const envVars = configDotenv().parsed
if (!envVars) {
  throw new Error("No environment variables found")
}

const baseUrl = envVars.DASHBOARD_BBB_BASE_URL
const login = envVars.KEYCLOAK_LOGIN
const password = envVars.KEYCLOAK_PASSWORD

function delay(time: number): Promise<void> {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  })
}

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  })
  const page = await browser.newPage()

  // Navigate the page to a URL
  await page.goto(baseUrl)

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 })

  const keycloakLoginSelector = "button"
  await page.waitForSelector(keycloakLoginSelector)
  await page.click(keycloakLoginSelector)

  await page.waitForNavigation()

  const socialLoginLink = "a#social-keycloak-oidc"
  await page.waitForSelector(socialLoginLink)
  await page.click(socialLoginLink)

  await page.waitForSelector("input#username")

  await page.type("input#username", login)
  await page.type("input#password", password)

  const submitLoginSelector = "input[type=submit]"
  await page.waitForSelector(submitLoginSelector)
  await page.click(submitLoginSelector)

  await page.waitForNavigation()

  try {
    const response = await page.goto(`${baseUrl}api/generate-courses-list`, {waitUntil: "domcontentloaded"});
    if(response?.ok()) {
      const courses = await response.json()
      console.log(courses);
      for(const course of courses) {
        const useCase = new CreateCourseAndAffectCohort(new CohortRepository(db))
        await useCase.createCourseAndAffectCohort(course);
      }
    }
  } catch (error) {
    console.error("Error while fetching courses", error)
  }

  await db.destroy()
  await browser.close()
})()

