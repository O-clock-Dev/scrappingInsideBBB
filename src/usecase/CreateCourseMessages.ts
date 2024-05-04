import crypto from "crypto"
import { db } from "../core/database"
import { CourseRepository } from "../repositories/CourseRepository"
import { StudentRepository } from "../repositories/StudentRepository";
import { CohortRepository } from "../repositories/CohortRepository";
import { MessageRepository } from "../repositories/MessageRepository";
import { XMLParser } from "fast-xml-parser";
import slugify from "slugify";


interface messageData {
  in: string;
  direction: string;
  name: string;
  message: string;
  senderRole: string;
  chatEmphasizedText: string;
  target: string;
}

export default class CreateCourseMessages {

  constructor(private studentRepository: StudentRepository, private cohortRepository: CohortRepository, private courseRepository: CourseRepository, private messageRepository: MessageRepository) {
  }

  dateToMysqlFormatFromTimeZone(date: Date): string {
    date.setTime(date.getTime() - date.getTimezoneOffset()*60000);
    return date.toISOString().slice(0, 19).replace('T', ' ')
  }

  async createCourseMessages(courseMeetingId: string, creationDate: string, cohortSlug: string, xmlData: string): Promise<void> {
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix : ""})
    const dataJson = await parser.parse(xmlData)

    // Récupérer les étudiants dans la DB
    const students = await this.studentRepository.findByCohortSlug(cohortSlug)

    // Récupérer la promo dans la DB
    const cohort = await this.cohortRepository.findBySlug(cohortSlug)
    if(!cohort) {
      return
    }

    const dbStudents = students.map(student => {
      return {
        id: student.id,
        slug: slugify(student.firstName + '-' + student.lastName, { lower: true }),
        firstName: student.firstName,
        lastName: student.lastName
      }
    })

    for(let i = 0; i < dataJson.popcorn.chattimeline.length; i++) {
        const messageData: messageData = dataJson.popcorn.chattimeline[i];
        const name = messageData.name;
        const message = messageData.message;
        const senderRole = messageData.senderRole;
        const timestamp = messageData.in.split('.')[0];

        // Not capture messages from the moderators
        if(senderRole !== 'VIEWER') continue;

        const slug = slugify(name, { lower: true });
        const timestampFromStartTime = Number(creationDate) + Number(timestamp) * 1000

        // search course in DB
        const course = await this.courseRepository.findByMeetingId(courseMeetingId)

        // search student in DB
        const student = dbStudents.find(student => student.slug === slug)

        if(!student) {
          console.log(`[ERROR - student not found: ${name}`)
          console.log(`- name: ${name}`)
          //console.log(`- db student: ${student ? student.firstName + ' ' + student.lastName : 'not found'}`)
          console.log(`- message: ${message}`)
          console.log(`- timestamp: ${timestamp}`)
          console.log(`- timestampFromStartTime: ${new Date(timestampFromStartTime)}`)
          console.log(`- slug: ${slug}`)
          console.log('------------------------')
        }

        // create message in DB
        const messageId = crypto.randomBytes(16).toString("hex")
        await this.messageRepository.create({
          id: messageId,
          timestamp: timestamp,
          timestampFromStartDate: this.dateToMysqlFormatFromTimeZone(new Date(timestampFromStartTime)),
          message: message,
          course_id: course.id,
          student_id: student ? student.id : null,
          cohort_id: cohort.id
        })
      }
  }
}
