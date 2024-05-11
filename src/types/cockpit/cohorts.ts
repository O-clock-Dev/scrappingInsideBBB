export default interface CockpitCohortDate {
  date: string;
  timezone_type: number;
  timezone: string;
}

export default interface CockpitCohort {
  id: number;
  nickname: string;
  linkSlack: string;
  linkGithub: string;
  linkReplays: string;
  child_cohort: boolean;
  spe_cohort: boolean;
  parent_cohort: null;
  start_date: CockpitCohortDate;
  end_date: CockpitCohortDate;
  date_created: CockpitCohortDate;
  date_modified: CockpitCohortDate;
  keycloakId: string;
  details: string;
  activity: string;
}

export default interface CohortData {
  success: boolean;
  message: string;
  data: CockpitCohort[];
}
