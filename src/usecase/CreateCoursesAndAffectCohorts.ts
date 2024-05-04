import { StudentRepository } from "../repositories/StudentRepository.js"
import { CohortRepository } from "../repositories/CohortRepository.js"
import crypto from "crypto"
import { db } from "../core/database.js"

interface Course {
  name: string,
  id: string,   // meeting id
  dashboardUrl: string,
  replayUrl: string | null,
  creationDate: string,
  endDate: string,
}

export default class CreateCourseAndAffectCohort {
  private cohortRepository: CohortRepository

  constructor(cohortRepository: CohortRepository) {
    this.cohortRepository = cohortRepository
  }

  async createCourseAndAffectCohort(course: Course): Promise<void> {
    const courseSlug = course.name.toLowerCase().replace(/ /g, " ")
    const courseWords = courseSlug.split(" ");
    for(const word of courseWords) {
      const cohort = await this.cohortRepository.findLikeSlug(word)
      if(cohort) {
        console.log(`course slug : ${courseSlug}`)
        console.log(`cohort found : ${cohort.name}`)
        break
      }
    }
  }
}
