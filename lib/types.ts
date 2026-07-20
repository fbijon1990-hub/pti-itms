// Row types mirroring the Supabase schema (public schema).

export type Institution = {
  id: string;
  name: string;
  parent: string | null;
  location: string | null;
  signatory1: string | null;
  signatory2: string | null;
  cert_prefix: string | null;
  pass_mark: number | null;
  attendance_min: number | null;
  next_cert: number | null;
};

export type Competency = { id: string; name: string; area: string | null };

export type Facilitator = {
  id: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  rate: number | null;
  pay_mode: string | null;
  pay_ref: string | null;
  tax: number | null;
};

export type Participant = {
  id: string;
  name: string;
  gender: string | null;
  institution: string | null;
  dept: string | null;
  position: string | null;
  email: string | null;
  phone: string | null;
};

export type Budget = { id: string; title: string | null };
export type BudgetLine = {
  id: string;
  budget_id: string;
  item: string;
  budget: number;
  actual: number;
  sort: number;
};

export type TrainingStatus = "Planned" | "Open" | "Completed" | "Cancelled";
export type Training = {
  id: string;
  title: string;
  category: string | null;
  mode: string | null;
  venue: string | null;
  start_date: string | null;
  end_date: string | null;
  status: TrainingStatus;
  capacity: number | null;
  budget_id: string | null;
  days: number | null;
  objectives: string | null;
};

export type TrainingSession = { id: string; training_id: string; session_date: string };
export type Cohort = { id: string; training_id: string; name: string; capacity: number | null };
export type CohortMember = { cohort_id: string; participant_id: string };

export type NominationStatus = "Pending" | "Approved" | "Waitlisted" | "Rejected";
export type Nomination = {
  id: string;
  participant_id: string;
  training_id: string;
  nominated_by: string | null;
  justification: string | null;
  status: NominationStatus;
  cohort_id: string | null;
  nominated_on: string | null;
};

export type Attendance = {
  id: string;
  training_id: string;
  participant_id: string;
  session_date: string;
  checked_at: string | null;
  method: string | null;
};

export type Assessment = {
  id: string;
  training_id: string;
  type: "Pre" | "Post";
  title: string | null;
  max_score: number;
  threshold: number;
};
export type AssessmentScore = {
  id: string;
  assessment_id: string;
  participant_id: string;
  score: number;
};

export type Evaluation = {
  id: string;
  training_id: string;
  participant_id: string;
  content: number | null;
  facilitation: number | null;
  materials: number | null;
  logistics: number | null;
  overall: number | null;
  comment: string | null;
};

export type Honorarium = {
  id: string;
  training_id: string;
  facilitator_id: string;
  days: number;
  rate: number;
  gross: number;
  status: "Pending" | "Paid";
};

export type Certificate = {
  id: string;
  training_id: string;
  participant_id: string;
  number: string | null;
  issued_on: string | null;
};

export type CompetencyRecord = {
  id: string;
  participant_id: string;
  competency_id: string;
  training_id: string;
  pre: number | null;
  post: number | null;
};

export type Notification = {
  id: string;
  type: string;
  training_id: string | null;
  participant_id: string | null;
  subject: string | null;
  sent_on: string | null;
  status: string | null;
};
