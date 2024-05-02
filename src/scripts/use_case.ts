import { StudentRepository } from "../repositories/StudentRepository.js"
import { CohortRepository } from "../repositories/CohortRepository.js"
import crypto from "crypto"
import { db } from "../core/database.js"

export default class UseCase {
  private studentRepository: StudentRepository
  private cohortRepository: CohortRepository

  constructor(cohortRepository: CohortRepository, studentRepository: StudentRepository) {
    this.cohortRepository = cohortRepository
    this.studentRepository = studentRepository
  }

  dateToMysqlFormat(date: Date): string {
    return date.toISOString().slice(0, 19).replace("T", " ")
  }

  dateFromInsideFormatToMysqlFormat(date: string): string {
    // date : 3/10/2022 to 2022-03-10
    const [day, month, year] = date.split("/")
    // add 0 to month if it is less than 10
    const monthWithZero = month.length === 1 ? `0${month}` : month
    // add 0 to day if it is less than 10
    const dayWithZero = day.length === 1 ? `0${day}` : day
    console.log(`date recalculed : ${year}-${monthWithZero}-${dayWithZero}`)
    return this.dateToMysqlFormat(new Date(`${year}-${monthWithZero}-${dayWithZero}`))
  }

  async createCohort(name: string, start_date: string, end_date: string): Promise<string> {
    const cohortId = crypto.randomBytes(16).toString("hex")
    const defaultDate = this.dateToMysqlFormat(new Date('1970-01-01'))
    const cohort = await this.cohortRepository.create(
      {
        id: cohortId,
        name: name,
        start_date: start_date !== "" ? this.dateFromInsideFormatToMysqlFormat(start_date) : defaultDate,
        end_date: end_date !== "" ?  this.dateFromInsideFormatToMysqlFormat(end_date) : defaultDate,
      }
    )
    return cohortId
  }

  async createStudent(cohortId: string, name: string, github: string, email: string, exit: boolean): Promise<void> {
    const studentId = crypto.randomBytes(16).toString("hex")
    const student = await this.studentRepository.create(
      {
        id: studentId,
        name: name,
        github: github,
        email: email,
        exit: exit,
        cohort_id: cohortId,
      }
    )
  }
}

// const exec = async () => {
//   const useCase = new UseCase(new CohortRepository(db), new StudentRepository(db))
//   const cohortId: string = await useCase.createCohort()
//   await useCase.createStudent(cohortId)
//   db.destroy()
//   console.log("Student creation started")
// }

// exec()
