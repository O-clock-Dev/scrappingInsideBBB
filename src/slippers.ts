import { configDotenv } from "dotenv";
import { db } from "./core/database.js";
import { CohortRepository } from "./repositories/CohortRepository";
import { CourseRepository } from "./repositories/CourseRepository";
import select from "@inquirer/select";
import fs from "node:fs";
import slugify from "slugify";
const { parse } = require("csv-parse");
import crypto from "crypto";
import { StudentRepository } from "./repositories/StudentRepository.js";
import { MessageRepository } from "./repositories/MessageRepository.js";

// Ce script permet d'importer les données CSV extraites
// via l'extension chrome permettant de récupérer les messages des
// étudiants

interface CsvData {
  name: string;
  slugName: string;
  courseTimestamp: number;
  courseEndTimestamp: number;
  messageTimestamp: number;
  message: string;
  role: string;
}

function dateToMysqlFormatFromTimeZone(date: Date): string {
  date.setTime(date.getTime() - date.getTimezoneOffset() * 60000);
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function splitFullName(
  fullName: string
): { firstName: string; lastName: string } | undefined {
  const regexLastName = / [A-Z0-9ÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ._-\s']+/gm;
  // split fullName into first and last name
  const lastName = regexLastName.exec(fullName);
  if (lastName?.length) {
    return {
      firstName: fullName.replace(lastName[0], "").trim(),
      lastName: lastName[0],
    };
  } else {
    console.error(`[ERROR] - Full name : ${fullName} - Last name not found`);
  }
}

function dateFrToTimestamp(
  frDate: string
):
  | {
      messageTimestamp: number;
      courseTimestamp: number;
      courseEndTimestamp: number;
    }
  | undefined {
  // vendredi, 31 mai 2024, 13:43
  const frMonths = {
    janvier: "01",
    février: "02",
    mars: "03",
    avril: "04",
    mai: "05",
    juin: "06",
    juillet: "07",
    août: "08",
    septembre: "09",
    octobre: "10",
    novembre: "11",
    décembre: "12",
  };
  const regexFrDate =
    /([\w]+), ([0-9]{2}) ([\w]+) ([0-9]{4}), ([0-9]{2}):([0-9]{2})/gm;
  const dateData = regexFrDate.exec(frDate);

  if (dateData?.length === 7) {
    const month = dateData[3] as
      | "janvier"
      | "février"
      | "mars"
      | "avril"
      | "mai"
      | "juin"
      | "juillet"
      | "août"
      | "septembre"
      | "octobre"
      | "novembre"
      | "décembre";

    // on a bien une date formatée comme attendue

    const formattedMessageDate = `${dateData[4]}-${frMonths[month]}-${dateData[2]}T${dateData[5]}:${dateData[6]}:00+02:00`;
    const messageDate = Date.parse(formattedMessageDate);

    const formattedCourseDate = `${dateData[4]}-${frMonths[month]}-${dateData[2]}T00:00:00+02:00`;
    const courseDate = Date.parse(formattedCourseDate);

    const formattedCourseEndDate = `${dateData[4]}-${frMonths[month]}-${dateData[2]}T23:59:59+02:00`;
    const courseEndDate = Date.parse(formattedCourseEndDate);

    return {
      messageTimestamp: messageDate,
      courseTimestamp: courseDate,
      courseEndTimestamp: courseEndDate,
    };
  }
  return undefined;
}

function getLine(row: string[], csvData: CsvData[]): void {
  // Il faut remplacer les ; par un autre séparateur (£ par exemple)
  // Il faut remplacer les " par des simples quotes
  const name = row[0];
  const date = row[1];
  const message = row[2];
  const role = row[3];

  if (role === "student") {
    const dataFullName = splitFullName(name);
    const dateTimestamp = dateFrToTimestamp(date);

    if (
      dataFullName &&
      dataFullName.firstName &&
      dataFullName.lastName &&
      dateTimestamp
    ) {
      const firstName = dataFullName.firstName;
      const lastName = dataFullName.lastName.substring(1);

      const slugName = `${slugify(lastName, { lower: true })}-${slugify(
        firstName,
        { lower: true }
      )}`;

      console.log(`--------------------------`);
      console.log(`Etudiant : ${name}`);
      console.log(`Slug name : ${slugName}`);
      console.log(`Date : ${date}`);
      console.log(dateTimestamp);
      console.log(`Message : ${message}`);
      console.log(`Role : ${role}`);

      //console.log('ajout nouvelle ligne')

      csvData.push({
        name,
        slugName,
        courseTimestamp: dateTimestamp.courseTimestamp,
        courseEndTimestamp: dateTimestamp.courseEndTimestamp,
        messageTimestamp: dateTimestamp.messageTimestamp,
        message,
        role,
      });
    }
  }
}

function readCsvFile(file: string, csvData: CsvData[]): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.createReadStream(file)
      .pipe(parse({ delimiter: "£", from_line: 1 }))
      .on("data", async (row: string[]) => {
        await getLine(row, csvData);
      })
      .on("error", (err: unknown) => {
        reject(err);
      })
      .on("end", () => {
        console.log("Le fichier a bien été traité");
        resolve();
      });
  });
}

const envVars = configDotenv().parsed;
if (!envVars) {
  throw new Error("No environment variables found");
}

const slippersBaseDir = envVars.SLIPPERS_BASE_FOLDER;
const slippersInDir = envVars.SLIPPERS_IN_FOLDER;
const slippersDoneDir = envVars.SLIPPERS_DONE_FOLDER;

(async () => {
  const courseRepository = new CourseRepository(db);
  const cohortRepository = new CohortRepository(db);
  const studentRepository = new StudentRepository(db);
  const messageRepository = new MessageRepository(db);

  const cohorts = await cohortRepository.findAll();
  const choices = [];
  for (const cohort of cohorts) {
    choices.push({
      name: cohort.name!,
      value: cohort.id!,
    });
  }

  const cohortId = await select({
    message: "Sélectionnez la promo concernée ?",
    choices: choices,
  });

  const csvData: CsvData[] = [];

  // Importer les données
  const inDir = `${slippersBaseDir}/${slippersInDir}`;
  await Promise.all(
    fs.readdirSync(inDir).map(async (file) => {
      if (file.includes(".csv")) {
        await readCsvFile(`${inDir}/${file}`, csvData);
      }
    })
  );

  // Parcourir les données pour les insertions en base
  const creatingCourses: {
    courseDate: string;
    courseTimestamp: number;
    courseEndTimestamp: number;
    courseId: string|undefined;
  }[] = [];
  for (const dataLine of csvData) {
    const courseDateString = dateToMysqlFormatFromTimeZone(
      new Date(dataLine.courseTimestamp)
    ).slice(0, 10);
    const foundCreatingCourse = creatingCourses.find(
      (value) => value.courseDate === courseDateString
    );
    if (!foundCreatingCourse) {
      creatingCourses.push({ courseDate: courseDateString, courseTimestamp: dataLine.courseTimestamp, courseEndTimestamp: dataLine.courseEndTimestamp, courseId: undefined });
    }
  }
  // On parcours les dates trouvées, pour chercher ou créer le cours
  for (const creatingCourse of creatingCourses) {
    const course = await courseRepository.findByCohortIdAndDate(
      cohortId,
      creatingCourse.courseDate
    );
    if (!course) {
      // s'il n'existe pas, on le créer
      const courseId = crypto.randomBytes(16).toString("hex");
      await courseRepository.create({
        id: courseId,
        meetingId: "",
        name: `Cours Slippers Promo du ${creatingCourse.courseDate}`,
        dashboardUrl: "",
        replayUrl: "",
        creation_date: dateToMysqlFormatFromTimeZone(
          new Date(creatingCourse.courseTimestamp)
        ),
        end_date: dateToMysqlFormatFromTimeZone(
          new Date(creatingCourse.courseEndTimestamp)
        ),
        cohort_id: cohortId,
      });
      creatingCourse.courseId = courseId
    } else {
      creatingCourse.courseId = course.id
    }
  }

  // création des messages
  for (const dataLine of csvData) {
    const courseDateString = dateToMysqlFormatFromTimeZone(
      new Date(dataLine.courseTimestamp)
    ).slice(0, 10);
    const courseId = creatingCourses.find(
      (value) => value.courseDate === courseDateString
    )?.courseId;
    const student = await studentRepository.findBySlug(dataLine.slugName)
    if(student && courseId) {
      // cohortId => déjà OK
      const studentId = student.id

      // console.log(`Course ID : ${courseId}`)
      // console.log(`student ID : ${studentId}`)
      // console.log(`Cohort ID : ${cohortId}`)

      // create message in DB
      const messageId = crypto.randomBytes(16).toString("hex")
      await messageRepository.create({
        id: messageId,
        timestamp: '',
        timestampFromStartDate: dateToMysqlFormatFromTimeZone(new Date(dataLine.messageTimestamp)),
        message: dataLine.message,
        course_id: courseId,
        student_id: studentId,
        cohort_id: cohortId
      })
    }
  }

  await db.destroy();
})();
