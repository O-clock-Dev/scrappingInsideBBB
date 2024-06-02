import puppeteer from "puppeteer"
import { configDotenv } from "dotenv"
import Me from "./types/cockpit/me.js"
import SearchCohortAndAffectCohortId from "./usecase/cockpit/SearchCohortAndAffectCockpitId.js"
import { CohortRepository } from "./repositories/CohortRepository.js"
import { db } from "./core/database.js"

// Ce script permet de se connecter à l'API
// pour récupérer les id des promos et affecter l'id de la promo
// provenant de l'API à la promo dans la DB

const envVars = configDotenv().parsed
if (!envVars) {
  throw new Error("No environment variables found")
}

const cockpitBaseUrl = envVars.COCKPIT_BASE_URL
const cockpitApiKey = envVars.COCKPIT_API_KEY

function delay(time: number): Promise<void> {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  });
}

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage()

  const headers = {
    "X-AUTH-TOKEN": cockpitApiKey,
  };

  let login: null | string = null

  // Get information about me
  try {
    await page.setExtraHTTPHeaders(headers)
    const response = await page.goto(`${cockpitBaseUrl}me`)
    if(response?.ok()) {
      const me: Me = await response.json()
      login = me.data.username
    }
  } catch (error) {
    console.error("Error while fetching courses", error)
  }

  if (!login) {
    console.error("No login found")
    await browser.close()
    return
  }

  // Get information about cohorts
  try {
    await page.setExtraHTTPHeaders(headers)
    const response = await page.goto(`${cockpitBaseUrl}cohorts/current`)
    if(response?.ok()) {
      const cohorts = await response.json()
      const usecase = new SearchCohortAndAffectCohortId(new CohortRepository(db))
      await usecase.createCourseAndAffectCohort(cohorts)
    }
  } catch (error) {
    console.error("Error while fetching cohorts", error)
  }

  await db.destroy()
  await browser.close()
})();
