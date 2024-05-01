import { StudentRepository } from "../repositories/StudentRepository"
import crypto from "crypto"
import { db } from "../core/database"

export default class StudentTest {
  private studentRepository: StudentRepository

  constructor(studentRepository: StudentRepository) {
    this.studentRepository = studentRepository
  }

  async createStudent() {
    await this.studentRepository.create(
      {
        id: crypto.randomBytes(16).toString("hex"),
        first_name: "John",
        last_name: "Doe",
        email: ""
      }
    )
    console.log("Student created")
  }
}

const exec = async () => {
  const studentTest = new StudentTest(new StudentRepository(db))
  await studentTest.createStudent()
  db.destroy()
  console.log("Student creation started")
}

exec()
