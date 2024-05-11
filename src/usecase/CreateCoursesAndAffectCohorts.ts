import { CohortRepository } from "../repositories/CohortRepository"
import crypto from "crypto"
import { CourseRepository } from "../repositories/CourseRepository"

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
  private courseRepository: CourseRepository

  constructor(cohortRepository: CohortRepository, courseRepository: CourseRepository) {
    this.cohortRepository = cohortRepository
    this.courseRepository = courseRepository
  }

  dateToMysqlFormatFromTimeZone(date: Date): string {
    date.setTime(date.getTime() - date.getTimezoneOffset()*60000);
    return date.toISOString().slice(0, 19).replace('T', ' ')
  }

  async createCourseAndAffectCohort(course: Course): Promise<string|undefined> {
    const courseSlug = course.name.toLowerCase().replace(/ /g, " ")
    const courseWords = courseSlug.split(" ");

    const startDate = new Date(course.creationDate)
    const endDate = new Date(course.endDate)

    // ne prendre que les cours de plus d'une heure avec replay
    const isReplay = course.replayUrl !== null
    const diffHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
    if(diffHours < 1 || !isReplay) {
      return
    }

    for(const word of courseWords) {
      const cohort = await this.cohortRepository.findLikeSlug(word)
      if(cohort) {
        console.log(`course slug : ${courseSlug}`)
        console.log(`cohort found : ${cohort.name}`)
        // test de la date
        const startDateToMysql = this.dateToMysqlFormatFromTimeZone(startDate)
        const endDateToMysql = this.dateToMysqlFormatFromTimeZone(endDate)
        console.log(`- start date : ${startDateToMysql}`)
        console.log(`- end date : ${endDateToMysql}`)

        // create course
        const courseId = crypto.randomBytes(16).toString("hex")
        await this.courseRepository.create({
          id: courseId,
          meetingId: course.id,
          name: course.name,
          dashboardUrl: course.dashboardUrl,
          replayUrl: course.replayUrl,
          creation_date: startDateToMysql,
          end_date: endDateToMysql,
          cohort_id: cohort.id
        })
        return cohort.slug ?? ''
      }
    }
  }
}
