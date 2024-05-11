import { CohortRepository } from "../../repositories/CohortRepository"
import crypto from "crypto"
import CohortData from "../../types/cockpit/cohorts";
import CockpitCohortDate from "../../types/cockpit/cohorts";

export default class SearchCohortAndAffectCohortId {
  private cohortRepository: CohortRepository

  constructor(cohortRepository: CohortRepository) {
    this.cohortRepository = cohortRepository
  }

  jsonToMysqlDate(cockpitDate: CockpitCohortDate): Date {
    /*
      {
        date: '2020-05-14 00:00:00.000000',
        timezone_type: 3,
        timezone: 'Europe/Berlin'
      }
    */
    // convert with timezone
    const [dateString, timeString] = cockpitDate.date.split(" ")
    const [year, month, day] = dateString.split("-")
    const [hour, minute, second] = timeString.split(":")
    // define GMT with timezone_type
    const GMT = `00:00`
    const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}-${GMT}`)
    return date
  }

  async createCourseAndAffectCohort(cockpitCohortsData: CohortData) {
    for(const cockpitCohort of cockpitCohortsData.data) {
      const cohortSlug = cockpitCohort.nickname.toLowerCase().replace(/ /g, " ")
      console.log(`cohort slug in json : ${cohortSlug}`)

      // TODO: gérer les cas spéciaux (notamment les RED/BLUE/GREEN/... et les mixs de promos)
      if(cohortSlug.includes("red") || cohortSlug.includes("blue") || cohortSlug.includes("green") || cohortSlug.includes("yellow") || cohortSlug.includes(" x ")) {
        continue
      }
      const cohortWords = cohortSlug.split(" ");

      for(const word of cohortWords) {
        const startDate = this.jsonToMysqlDate(cockpitCohort.start_date)
        const cohort = await this.cohortRepository.findLikeSlugAndStartDate(word, startDate)
        if(cohort) {
          console.log(`cohort found : ${cohort?.name}, ${cockpitCohort.id}`)
          cohort.cockpit_id = `${cockpitCohort.id}`
          await this.cohortRepository.update(cohort.id, cohort)
        }
      }
    }
  }
}
