// rajout du slug dans les tables students et cohorts

import { db } from "../core/database";
import { CohortRepository } from "../repositories/CohortRepository";
import { StudentRepository } from "../repositories/StudentRepository";
import { Cohort, Student } from "../core/types";
import slugify from "slugify";

const cohortRepository = new CohortRepository(db)
cohortRepository.findAll().then((cohorts: Cohort[]) => {
  for(const cohort of cohorts) {
    const slug = slugify(cohort.name ?? '', { lower: true })
    cohortRepository.updateSlug(cohort.id, slug)
  }
})

console.log("Slugify cohorts done !")

const studentRepository = new StudentRepository(db)
studentRepository.findAll().then((students: Student[]) => {
  for(const student of students) {
    const slug = slugify(student.fullName ?? '', { lower: true })
    studentRepository.updateSlug(student.id, slug)
  }
})

console.log("Slugify students done !")

db.destroy().then(() => {
  console.log('Database destroyed')
}).catch((error) => {
  console.error(error)
});

