-- =====================================================================
-- PTI ITMS - sample data (optional). Run AFTER 0001_init.sql.
-- Safe to skip if you want an empty system. Re-runnable (upserts).
-- =====================================================================

insert into institution (id,name,parent,location,signatory1,signatory2,cert_prefix,pass_mark,attendance_min,next_cert)
values ('default','Parliamentary Training Institute','Parliament of Ghana','Parliament House, Accra',
        'Director, PTI','Clerk to Parliament','PTI',12,70,4)
on conflict (id) do update set
  name=excluded.name, parent=excluded.parent, location=excluded.location;

insert into competencies (id,name,area) values
  ('c-drft','Legislative Drafting','Legislative'),
  ('c-comm','Committee Systems & Oversight','Oversight'),
  ('c-budg','Budget & Fiscal Analysis','Financial'),
  ('c-proc','Parliamentary Procedure','Procedural'),
  ('c-res','Research & Policy Analysis','Research'),
  ('c-cons','Constituency & Public Engagement','Representation'),
  ('c-ict','Digital & ICT Skills','Support')
on conflict (id) do nothing;

insert into facilitators (id,name,title,email,phone,rate,pay_mode,pay_ref,tax) values
  ('f-1','Prof. Ama Serwaa','Senior Fellow, Governance','a.serwaa@example.gh','0244000111',2500,'Bank transfer','GCB 1002-33',7.5),
  ('f-2','Dr. Kwabena Mensah','Public Finance Specialist','k.mensah@example.gh','0201222333',2200,'MoMo','0201222333',7.5),
  ('f-3','Mrs. Efua Boateng','Legislative Counsel','e.boateng@example.gh','0277444555',2000,'Bank transfer','Ecobank 5567-90',7.5)
on conflict (id) do nothing;

insert into facilitator_competencies (facilitator_id,competency_id) values
  ('f-1','c-comm'),('f-1','c-proc'),
  ('f-2','c-budg'),('f-2','c-res'),
  ('f-3','c-drft'),('f-3','c-proc')
on conflict do nothing;

insert into participants (id,name,gender,institution,dept,position,email,phone) values
  ('p-1','Hon. Yaw Owusu','M','Parliament of Ghana','MP - Sunyani West','Member of Parliament','y.owusu@parliament.gh','0244111222'),
  ('p-2','Akosua Frimpong','F','Parliament of Ghana','Research Department','Research Assistant','a.frimpong@parliament.gh','0209333444'),
  ('p-3','Kojo Asante','M','Parliament of Ghana','Committees Office','Assistant Clerk','k.asante@parliament.gh','0555666777'),
  ('p-4','Adwoa Nyarko','F','Parliament of Ghana','Research Department','Research Assistant','a.nyarko@parliament.gh','0243888999'),
  ('p-5','Hon. Fatima Alhassan','F','Parliament of Ghana','MP - Tamale North','Member of Parliament','f.alhassan@parliament.gh','0208111000'),
  ('p-6','Samuel Tetteh','M','Parliament of Ghana','Finance Office','Budget Analyst','s.tetteh@parliament.gh','0271444555'),
  ('p-7','Grace Adjei','F','Parliament of Ghana','Committees Office','Committee Clerk','g.adjei@parliament.gh','0246777888'),
  ('p-8','Ibrahim Mahama','M','Parliament of Ghana','Hansard','Hansard Reporter','i.mahama@parliament.gh','0209222333')
on conflict (id) do nothing;

insert into budgets (id,title) values
  ('b-1','Committee Oversight Masterclass'),
  ('b-2','Budget Analysis & Fiscal Oversight Workshop'),
  ('b-3','Legislative Drafting Essentials')
on conflict (id) do nothing;

insert into budget_lines (budget_id,item,budget,actual,sort) values
  ('b-1','Facilitator honoraria',9000,8325,1),
  ('b-1','Venue & conference package',6000,5400,2),
  ('b-1','Training materials',2000,1850,3),
  ('b-1','Refreshments',3000,2900,4),
  ('b-1','Participant transport',2400,2400,5),
  ('b-1','Contingency',600,0,6),
  ('b-2','Facilitator honoraria',6600,0,1),
  ('b-2','Venue hire',4000,0,2),
  ('b-2','Training materials',1500,0,3),
  ('b-2','Refreshments',2500,0,4),
  ('b-2','Per diem',5000,0,5),
  ('b-3','Facilitator honoraria',4400,0,1),
  ('b-3','Virtual platform',800,0,2),
  ('b-3','Materials (digital)',500,0,3)
on conflict do nothing;

insert into trainings (id,title,category,mode,venue,start_date,end_date,status,capacity,budget_id,days,objectives) values
  ('t-1','Committee Oversight Masterclass','Oversight','In-person','PTI Hall A, Parliament House','2026-06-10','2026-06-12','Completed',24,'b-1',3,'Strengthen committee members and clerks in oversight practice, evidence gathering, and report writing.'),
  ('t-2','Budget Analysis & Fiscal Oversight Workshop','Financial','In-person','PTI Hall B, Parliament House','2026-07-28','2026-07-30','Open',20,'b-2',3,'Build capacity in reading national budgets, MTEF, and holding the executive to account on public finance.'),
  ('t-3','Legislative Drafting Essentials (Virtual)','Legislative','Virtual','Online (Zoom)','2026-08-18','2026-08-19','Planned',30,'b-3',2,'Introduce drafting principles, structure of bills, and amendment procedure for research staff.')
on conflict (id) do nothing;

insert into training_sessions (training_id,session_date) values
  ('t-1','2026-06-10'),('t-1','2026-06-11'),('t-1','2026-06-12'),
  ('t-2','2026-07-28'),('t-2','2026-07-29'),('t-2','2026-07-30'),
  ('t-3','2026-08-18'),('t-3','2026-08-19')
on conflict do nothing;

insert into training_facilitators (training_id,facilitator_id) values
  ('t-1','f-1'),('t-1','f-2'),('t-2','f-2'),('t-3','f-3')
on conflict do nothing;

insert into training_competencies (training_id,competency_id) values
  ('t-1','c-comm'),('t-1','c-budg'),('t-2','c-budg'),('t-2','c-res'),('t-3','c-drft'),('t-3','c-proc')
on conflict do nothing;

insert into cohorts (id,training_id,name,capacity) values
  ('co-1','t-1','Group A',12),
  ('co-2','t-1','Group B',12)
on conflict (id) do nothing;

insert into cohort_members (cohort_id,participant_id) values
  ('co-1','p-1'),('co-1','p-3'),('co-1','p-5'),('co-1','p-7'),
  ('co-2','p-2'),('co-2','p-8')
on conflict do nothing;

insert into nominations (id,participant_id,training_id,nominated_by,justification,status,cohort_id,nominated_on) values
  ('n-1','p-1','t-1','Clerk to Parliament','Chairs a standing committee.','Approved','co-1','2026-05-20'),
  ('n-2','p-3','t-1','Director, Committees','Supports three committees.','Approved','co-1','2026-05-20'),
  ('n-3','p-5','t-1','Clerk to Parliament','New committee member.','Approved','co-1','2026-05-21'),
  ('n-4','p-7','t-1','Director, Committees','Committee clerk.','Approved','co-1','2026-05-21'),
  ('n-5','p-2','t-1','Head of Research','Research support to committees.','Approved','co-2','2026-05-22'),
  ('n-6','p-8','t-1','Editor of Debates','Coverage of committee sittings.','Approved','co-2','2026-05-22'),
  ('n-7','p-6','t-2','Director of Finance','Lead budget analyst.','Approved',null,'2026-07-01'),
  ('n-8','p-2','t-2','Head of Research','Fiscal research portfolio.','Pending',null,'2026-07-03'),
  ('n-9','p-4','t-2','Head of Research','Supports finance committee.','Pending',null,'2026-07-03')
on conflict (id) do nothing;

-- attendance for completed t-1 (present rows only)
insert into attendance (training_id,participant_id,session_date,checked_at,method) values
  ('t-1','p-1','2026-06-10','09:00','QR'),('t-1','p-1','2026-06-11','09:01','Manual'),('t-1','p-1','2026-06-12','09:02','QR'),
  ('t-1','p-3','2026-06-10','09:00','QR'),('t-1','p-3','2026-06-11','09:01','Manual'),('t-1','p-3','2026-06-12','09:02','QR'),
  ('t-1','p-5','2026-06-10','09:00','QR'),('t-1','p-5','2026-06-11','09:01','Manual'),
  ('t-1','p-7','2026-06-10','09:00','QR'),('t-1','p-7','2026-06-11','09:01','Manual'),('t-1','p-7','2026-06-12','09:02','QR'),
  ('t-1','p-2','2026-06-10','09:00','QR'),('t-1','p-2','2026-06-12','09:02','QR'),
  ('t-1','p-8','2026-06-10','09:00','QR'),('t-1','p-8','2026-06-11','09:01','Manual'),('t-1','p-8','2026-06-12','09:02','QR')
on conflict do nothing;

insert into assessments (id,training_id,type,title,max_score,threshold) values
  ('as-1','t-1','Pre','Oversight Pre-Assessment',20,12),
  ('as-2','t-1','Post','Oversight Post-Assessment',20,12)
on conflict (id) do nothing;

insert into assessment_scores (assessment_id,participant_id,score) values
  ('as-1','p-1',11),('as-1','p-3',9),('as-1','p-5',8),('as-1','p-7',12),('as-1','p-2',10),('as-1','p-8',7),
  ('as-2','p-1',18),('as-2','p-3',16),('as-2','p-5',15),('as-2','p-7',19),('as-2','p-2',17),('as-2','p-8',14)
on conflict do nothing;

insert into evaluations (id,training_id,participant_id,content,facilitation,materials,logistics,overall,comment) values
  ('ev-1','t-1','p-1',5,5,4,4,5,'Excellent, very practical.'),
  ('ev-2','t-1','p-3',4,5,4,3,4,'More case studies please.'),
  ('ev-3','t-1','p-7',5,4,5,4,5,''),
  ('ev-4','t-1','p-2',4,4,3,4,4,'Good pace.'),
  ('ev-5','t-1','p-8',5,5,4,5,5,'')
on conflict (id) do nothing;

insert into honoraria (id,training_id,facilitator_id,days,rate,gross,status) values
  ('h-1','t-1','f-1',3,1500,4500,'Paid'),
  ('h-2','t-1','f-2',2,1912.5,3825,'Paid')
on conflict (id) do nothing;

insert into certificates (id,training_id,participant_id,number,issued_on) values
  ('ct-1','t-1','p-1','PTI/2026/0001','2026-06-13'),
  ('ct-2','t-1','p-7','PTI/2026/0002','2026-06-13'),
  ('ct-3','t-1','p-3','PTI/2026/0003','2026-06-13')
on conflict (id) do nothing;

insert into competency_records (id,participant_id,competency_id,training_id,pre,post) values
  ('cr-1','p-1','c-comm','t-1',2,4),
  ('cr-2','p-3','c-comm','t-1',2,4),
  ('cr-3','p-7','c-comm','t-1',3,5),
  ('cr-4','p-1','c-budg','t-1',2,3)
on conflict (id) do nothing;

insert into notifications (id,type,training_id,participant_id,subject,sent_on,status) values
  ('no-1','Invitation','t-1','p-1','Invitation: Committee Oversight Masterclass','2026-05-25','Sent'),
  ('no-2','Invitation','t-1','p-3','Invitation: Committee Oversight Masterclass','2026-05-25','Sent'),
  ('no-3','Reminder','t-2','p-6','Reminder: Budget Analysis Workshop begins soon','2026-07-15','Sent')
on conflict (id) do nothing;
