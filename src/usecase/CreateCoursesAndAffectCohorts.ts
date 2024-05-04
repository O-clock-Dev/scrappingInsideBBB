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

export default class CreateCohortsAndStudentsUseCase {
  private cohortRepository: CohortRepository

  constructor(cohortRepository: CohortRepository) {
    this.cohortRepository = cohortRepository
  }

  async createCourseAndAffectCohort(course: Course): Promise<void> {
    const cohort = await this.cohortRepository

  }
}
