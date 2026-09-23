# TalentBridgeHub project proposal sections

## Overview

TalentBridgeHub is a web-based recruitment platform designed to connect people looking for work with companies that need to recruit. The project addresses a common problem in recruitment: vacancy information, candidate profiles, applications, employer communication, and administrative review are often handled through separate tools. By bringing these activities together, TalentBridgeHub gives each participant a clearer workflow and gives administrators a central place to maintain the quality of the service.

The system has three main roles. Job seekers can register, build a professional profile, search approved vacancies, submit applications, and follow the progress of those applications. Companies can create an employer account, complete an approval process, publish vacancies, review applicants, and manage company information. Administrators can moderate accounts and jobs, maintain reference data, publish career advice, review activity, manage notifications, and control the availability of the public site.

The project is implemented as a full-stack application using React and TypeScript on the frontend and an Express, tRPC, Drizzle, and MySQL-compatible database stack on the backend. It is deployed through managed hosting with managed storage for profile photos, company logos, and résumé files. The final system is available at [talenthub-gkbobftg.manus.space](https://talenthub-gkbobftg.manus.space).

## Aim

The aim of this project is to design, develop, and deploy a secure and usable recruitment platform that enables job seekers and companies to manage the main stages of recruitment through one integrated web application.

## Objectives

The project objectives are to:

1. Analyse the needs of job seekers, companies, and administrators and translate them into clear functional requirements.
2. Design a relational database that represents accounts, vacancies, applications, reviews, messages, notifications, and administrative records.
3. Develop a public interface for browsing companies, searching vacancies, reading career advice, and contacting the platform.
4. Develop a job-seeker portal with registration, profile editing, media upload, résumé management, applications, and notifications.
5. Develop a company portal with registration, approval, profile management, vacancy management, applicant review, and communication features.
6. Develop an administrator portal for moderation, content management, reference-data management, maintenance mode, and audit logging.
7. Protect private account information through role-based access control, validation, password hashing, and restricted public queries.
8. Preserve the supplied project data during migration to managed hosting and move new media uploads to managed storage.
9. Test the main workflows through automated tests, type checking, browser verification, and production-build checks.
10. Deploy the completed system and prepare technical and coursework documentation that explains its design and implementation.

## Scope

The project includes public vacancy discovery, job-seeker and company account workflows, administrator moderation, applications, reviews, notifications, private administrator–company messaging, career tips, site settings, managed media storage, and deployment. It does not include payroll, employee onboarding, payments, biometric checks, automated résumé scoring, video interviews, interview-calendar integration, or native mobile applications. These exclusions keep the work achievable within the final-year timebox while leaving a clear path for future development.

## Methodology

An iterative Agile methodology was selected because the application contains several connected roles and because important usability issues become visible only when a feature is used end to end. Development was organised as a sequence of short cycles rather than as one large implementation stage. Each cycle moved from requirement clarification to design, implementation, verification, and release review.

The project backlog was maintained as a checklist of outcomes. A task was treated as complete only after the relevant code, database behaviour, and user workflow had been checked. Automated tests were used for repeatable rules. Browser verification was used for flows that depend on authentication, uploads, navigation, or visual feedback. This combination helped identify issues such as legacy media values, public data exposure, approval-state handling, and development-preview WebSocket problems.

The migration to managed hosting required an additional data-preservation practice. Existing SQL records were inventoried before restoration. Missing records were reconciled without overwriting newer hosted data. Large media values were moved to managed storage where possible, while compatibility was retained for valid legacy records. This approach reduced the risk of losing reviews, jobs, applications, conversations, messages, notifications, profiles, and company branding during deployment.

## Timebox

The project timebox begins on **13 September 2026**. The planned schedule is:

| Dates | Activities | Deliverables |
|---|---|---|
| 13–15 September | Requirements, user roles, problem definition, and scope | Project brief and requirements list |
| 16–20 September | Existing-code review, SQL inventory, and database analysis | Initial schema and ERD |
| 21–27 September | Managed project setup, authentication, database connection, and routing | Working full-stack foundation |
| 28 September–4 October | Public pages, vacancy search, company directory, and career tips | Public website workflow |
| 5–11 October | Job-seeker registration, profile, photo, résumé, and applications | Job-seeker workflow |
| 12–18 October | Company registration, approval, vacancy management, and applicant review | Company workflow |
| 19–23 October | Administrator tools, reviews, notifications, messages, settings, and audit records | Administration workflow |
| 24–27 October | Data reconciliation, storage fixes, Contact delivery, branding, and photo cropping | Feature-complete release candidate |
| 28–30 October | Regression testing, type checking, build validation, and deployment checks | Verified production release |
| 31 October–2 November | Documentation, reflection, screenshots, and final coursework packaging | Final-year submission material |

## Expected outcome

The expected outcome is a deployed and testable recruitment platform that demonstrates practical application of requirements analysis, interface design, relational database modelling, typed API development, authentication, file storage, testing, and managed deployment. The supporting documentation should allow a reviewer to understand not only what the system does, but also why its boundaries, relationships, and development decisions were selected.

## References

[1]: https://react.dev/ "React documentation"
[2]: https://trpc.io/ "tRPC documentation"
[3]: https://orm.drizzle.team/ "Drizzle ORM documentation"
[4]: https://vitest.dev/ "Vitest documentation"
