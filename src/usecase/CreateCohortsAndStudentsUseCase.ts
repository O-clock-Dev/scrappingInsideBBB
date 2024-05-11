import { StudentRepository } from "../repositories/StudentRepository"
import { CohortRepository } from "../repositories/CohortRepository"
import crypto from "crypto"
import slugify from "slugify"

export default class CreateCohortsAndStudentsUseCase {
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

  splitFullName(fullName: string): { firstName: string, lastName: string } | undefined {
    const regexLastName = /^[A-Z0-9ÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ._-\s']+ /gm
    // split fullName into first and last name
    const lastName = regexLastName.exec(fullName)
    if(lastName?.length) {
      return { firstName: fullName.replace(lastName[0], "").trim(), lastName: lastName[0]}
    } else {
      console.error(`[ERROR] - Full name : ${fullName} - Last name not found`)
    }
  }

  async createCohort(name: string, start_date: string, end_date: string): Promise<string> {
    const cohortId = crypto.randomBytes(16).toString("hex")
    const defaultDate = this.dateToMysqlFormat(new Date('1990-01-01T00:00:01'))
    const cohort = await this.cohortRepository.create(
      {
        id: cohortId,
        name: name,
        slug: slugify(name, { lower: true }),
        start_date: start_date !== "" ? this.dateFromInsideFormatToMysqlFormat(start_date) : defaultDate,
        end_date: end_date !== "" ?  this.dateFromInsideFormatToMysqlFormat(end_date) : defaultDate,
      }
    )
    return cohortId
  }

  async createStudent(cohortId: string, fullName: string, github: string, email: string, exit: boolean): Promise<void> {
    const studentId = crypto.randomBytes(16).toString("hex")
    let firstName = '';
    let lastName = '';
    const dataFullName = this.splitFullName(fullName)

    if(dataFullName){
      firstName = dataFullName.firstName
      lastName = dataFullName.lastName
    }

    const student = await this.studentRepository.create(
      {
        id: studentId,
        fullName: fullName,
        lastName: lastName,
        firstName: firstName,
        slug: slugify(fullName, { lower: true }),
        github: github,
        email: email,
        exit: exit,
        cohort_id: cohortId,
      }
    )
  }
}
