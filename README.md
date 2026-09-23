# TalentBridgeHub

TalentBridgeHub is a full-stack recruitment platform that connects job seekers, companies, and administrators through one managed web application. The platform provides public vacancy discovery, job-seeker profiles and applications, company recruitment tools, administrative moderation, career content, reviews, notifications, private messaging, and configurable site settings.

The project was developed as a final-year software project and is deployed at [talenthub-gkbobftg.manus.space](https://talenthub-gkbobftg.manus.space).

## 1. Project overview

Traditional recruitment processes often separate vacancy advertising, applicant communication, company management, and administration across several services. TalentBridgeHub brings these activities into one system. A visitor can browse approved vacancies and company information without creating an account. A job seeker can create a profile, upload a photograph and résumé, apply for vacancies, and track application progress. A company can register, wait for approval, publish vacancies, review applicants, and communicate with the administrator. Administrators control the quality and visibility of the platform through moderation and content-management tools.

The platform is deliberately organised around three operational roles:

- **Job seekers** search for opportunities, maintain their professional information, and manage applications.
- **Companies** maintain an employer profile, publish vacancies after approval, review applications, and use company-facing communication features.
- **Administrators** approve or suspend accounts and vacancies, manage reference data and career content, inspect activity, and control maintenance mode.

## 2. Main features

### Public website

The public area contains the home page, company directory, vacancy search, vacancy details, career tips, contact page, privacy policy, and an administrator-controlled maintenance screen. Vacancy search supports keyword, category, location, and salary-band filtering. Only approved and publicly appropriate records are returned by public queries.

### Job-seeker portal

Job seekers can register and sign in, edit a profile, add a headline, biography, location, skills and desired category, upload a profile photo, attach a résumé, browse vacancies, submit applications, withdraw applications where permitted, view application history, and read notifications. The profile-photo workflow includes a square crop frame, zoom, repositioning, cancellation, and upload of only the confirmed crop to managed storage.

### Company portal

Companies can register and enter a pending state until an administrator reviews the account. Approved companies can manage their public profile, create and update vacancies, review incoming applications, change application statuses, view company-related reviews, and communicate with the administrator. Vacancies also pass through an administrative approval process before they become public.

### Administration portal

Administrators can review dashboards and recent activity, manage job seekers, companies, vacancies, applications, categories, locations, salary bands, career tips, platform settings, notifications, and maintenance mode. Administrative actions are recorded in an activity log. The separate administrator account model uses password hashing and role/status controls rather than exposing administrator credentials through public endpoints.

### Contact delivery

The Contact page submits messages through FormSubmit's AJAX endpoint. Visitors do not need a Google account. The form validates the submitted fields, uses a hidden honeypot field for basic spam resistance, remains on the TalentBridgeHub page, and displays an in-page success or failure state. Provider-managed delivery is configured for the project owner's email address.

## 3. Project scope

### Included in scope

The implemented system includes:

1. A responsive public recruitment website.
2. Separate job-seeker, company, and administrator workflows.
3. Authentication and session handling for the supported account types.
4. Vacancy creation, approval, publication, search, and filtering.
5. Job-seeker profile and résumé management.
6. Managed storage for profile photographs, company logos, and résumé files.
7. Job applications with a defined review lifecycle.
8. Company and job-seeker reviews.
9. Notifications for platform events.
10. Private administrator–company conversations and messages.
11. Career-tip content management.
12. Reference-data management for categories, locations, and salary bands.
13. Audit logging for administrator actions.
14. Maintenance mode, platform settings, and public data protection.
15. Automated tests, TypeScript validation, production builds, and managed deployment.

### Outside the current scope

The current release does not attempt to replace a full enterprise human-resources suite. It does not include payroll, employee onboarding, biometric verification, automated résumé scoring, video interviews, calendar integration, payments, native mobile applications, or a separate employer-to-candidate live chat system. Contact delivery is provider-managed rather than an internally hosted mail server. These boundaries keep the final-year project focused on the recruitment marketplace and its core workflows.

## 4. System architecture

TalentBridgeHub uses a layered full-stack architecture:

```text
Browser
  |
  | React pages, Wouter routes, Tailwind styling, React Query/tRPC hooks
  v
Express application server
  |
  | tRPC procedures, validation, authentication, authorisation, business rules
  v
Drizzle ORM
  |
  +--> MySQL-compatible TiDB database
  |
  +--> S3-compatible managed storage for profile and document media
  |
  +--> FormSubmit AJAX endpoint for Contact messages
```

The client code is stored under `client/`. Server routes, authentication, database helpers, storage handling, and tRPC procedures are under `server/`. Shared constants and types are under `shared/`. Database definitions and migrations are under `drizzle/`.

The server starts in `server/_core/index.ts`. It mounts the Express application, serves the frontend, exposes the tRPC API under `/api/trpc`, and connects the application to the managed runtime. The main application router is defined in `server/routers.ts`, while the database access layer is implemented in `server/db.ts`.

## 5. Technology stack

| Layer | Technologies used | Purpose |
|---|---|---|
| Frontend | React 19, TypeScript, Vite | Component-based user interface and development/build tooling |
| Styling | Tailwind CSS 4, CSS variables | Responsive layout, visual consistency, and theming |
| Routing | Wouter | Lightweight client-side route handling |
| Data fetching | tRPC 11, TanStack React Query, SuperJSON | Typed client–server procedures, caching, loading states, and serialisation |
| UI components | Radix UI, Lucide React | Accessible interaction primitives and interface icons |
| Backend | Node.js, Express 4, TypeScript | HTTP server, runtime integration, and application services |
| API contract | tRPC 11 and Zod | End-to-end type safety and input validation |
| Database | MySQL-compatible TiDB, Drizzle ORM | Relational persistence, queries, schema definition, and migrations |
| Authentication | Manus OAuth, role-specific sessions, JWT-compatible session handling, bcryptjs | Identity, login sessions, password protection, and role control |
| File storage | S3-compatible managed storage | Profile photos, company logos, and résumé files |
| Testing | Vitest, TypeScript compiler, browser workflow checks | Automated behaviour checks, type safety, and release verification |
| Deployment | Managed Manus hosting | Production hosting, database, storage integration, and public domain |

## 6. Entity Relationship Diagram

The following diagram is derived from `drizzle/schema.ts`. Solid relationship lines represent foreign-key relationships declared in the schema. `notifications` and `activity_logs` intentionally use role/target fields rather than a single foreign key because they can refer to more than one account or resource type.

```mermaid
erDiagram
    USERS {
        int id PK
        varchar openId UK
        text name
        varchar email
        varchar loginMethod
        enum role
        timestamp createdAt
        timestamp updatedAt
        timestamp lastSignedIn
    }
    ADMINS {
        bigint id PK
        varchar name
        varchar email UK
        varchar password
        enum role
        enum status
        timestamp createdAt
        timestamp updatedAt
    }
    JOB_SEEKERS {
        bigint id PK
        varchar name
        varchar email UK
        varchar password
        varchar phone
        varchar location
        varchar headline
        text bio
        text skills
        longtext photo_url
        varchar desired_category
        varchar resume_url
        enum status
        timestamp createdAt
        timestamp updatedAt
    }
    COMPANIES {
        bigint id PK
        varchar name
        longtext logo_url
        text description
        varchar website
        varchar owner_email
        varchar password
        varchar contact_name
        varchar phone
        varchar industry
        varchar town
        enum status
        timestamp createdAt
        timestamp updatedAt
    }
    COMPANY_REVIEWS {
        bigint id PK
        bigint company_id FK
        int rating
        text content
        timestamp createdAt
        timestamp updatedAt
    }
    JOB_SEEKER_REVIEWS {
        bigint id PK
        bigint job_seeker_id FK
        int rating
        text content
        timestamp createdAt
        timestamp updatedAt
    }
    JOB_CATEGORIES {
        bigint id PK
        varchar name
        varchar icon
        timestamp createdAt
        timestamp updatedAt
    }
    LOCATIONS {
        bigint id PK
        varchar name
        int sort_order
        timestamp createdAt
        timestamp updatedAt
    }
    SALARY_BANDS {
        bigint id PK
        varchar label UK
        int sort_order
        timestamp createdAt
        timestamp updatedAt
    }
    JOBS {
        bigint id PK
        varchar title
        bigint company_id FK
        varchar location
        varchar job_type
        varchar salary_range
        text description
        text responsibilities
        text requirements
        bigint category_id FK
        bigint salary_band_id FK
        enum status
        int application_count
        timestamp posted_at
        timestamp createdAt
        timestamp updatedAt
    }
    APPLICATIONS {
        bigint id PK
        bigint job_seeker_id FK
        bigint job_id FK
        bigint company_id FK
        longtext resume_url
        text cover_letter
        enum status
        timestamp createdAt
        timestamp updatedAt
    }
    CAREER_TIPS {
        bigint id PK
        varchar title
        varchar category
        varchar read_time
        text excerpt
        text body
        varchar cover_image
        enum status
        timestamp createdAt
        timestamp updatedAt
    }
    CONVERSATIONS {
        bigint id PK
        bigint company_id FK UK
        timestamp createdAt
        timestamp updatedAt
    }
    MESSAGES {
        bigint id PK
        bigint conversation_id FK
        enum sender
        text body
        enum read
        timestamp createdAt
    }
    PARTNER_COMPANIES {
        bigint id PK
        varchar name
        varchar logo
        text testimonial_quote
        int display_order
        timestamp createdAt
        timestamp updatedAt
    }
    ACTIVITY_LOGS {
        bigint id PK
        bigint admin_id FK
        varchar action
        varchar target_type
        bigint target_id
        timestamp createdAt
    }
    NOTIFICATIONS {
        bigint id PK
        enum recipientRole
        bigint recipient_id
        varchar title
        text content
        enum type
        enum is_read
        timestamp createdAt
    }
    SETTINGS {
        bigint id PK
        varchar key UK
        text value
        timestamp createdAt
        timestamp updatedAt
    }

    COMPANIES ||--o{ COMPANY_REVIEWS : receives
    JOB_SEEKERS ||--o{ JOB_SEEKER_REVIEWS : writes
    COMPANIES ||--o{ JOBS : posts
    JOB_CATEGORIES o|--o{ JOBS : classifies
    SALARY_BANDS o|--o{ JOBS : groups
    JOB_SEEKERS ||--o{ APPLICATIONS : submits
    JOBS ||--o{ APPLICATIONS : receives
    COMPANIES ||--o{ APPLICATIONS : owns
    COMPANIES ||--o| CONVERSATIONS : has
    CONVERSATIONS ||--o{ MESSAGES : contains
    ADMINS ||--o{ ACTIVITY_LOGS : creates
```

## 7. ERD explanation

The schema contains three main account structures. `job_seekers` stores candidate profiles and credentials. `companies` stores employer accounts and approval status. `admins` stores administrative accounts and their role/status. The `users` table supports the managed OAuth identity used by the wider runtime and is kept separate from the role-specific job-seeker and company account workflows.

A company can publish many jobs, while each job belongs to one company. A job may optionally reference a category and salary band. The `status` field on `jobs` supports the moderation lifecycle of pending, approved, and rejected posts. A job seeker can submit many applications, and each application links the job seeker, the selected job, and the owning company. The application status records progress from submission through review, shortlisting, interview, offer, or rejection.

Reviews are separated by subject. `company_reviews` links reviews to companies, while `job_seeker_reviews` links reviews to job seekers. This separation allows the public interface and future moderation rules to distinguish employer feedback from candidate feedback.

A company can have at most one administrator conversation because `conversations.company_id` is unique. Each conversation can contain many messages. Messages record whether the sender is the administrator or company and whether the message has been read.

`activity_logs` records administrator actions. It contains a foreign key to the administrator who performed the action and a flexible target type and target identifier for the affected record. `notifications` uses `recipientRole` and `recipientId` because a notification can target an administrator, job seeker, or company. These polymorphic fields are application-level references rather than direct database foreign keys.

`partner_companies` is intentionally separate from registered `companies`. It stores companies selected for the public partner display and therefore does not imply that every registered company is a showcased partner. `career_tips` stores publishable career content, while `settings` stores site-wide key/value configuration such as maintenance settings and contact information. `locations` supports ordered filter choices and is not directly foreign-keyed from jobs because the current job model stores the selected location as text.

## 8. Development methodology

The project followed an **iterative Agile methodology** with a fixed timebox beginning on **13 September 2026**. An iterative approach was appropriate because the system had several independent user roles and because usability and workflow issues could only be identified after the features were connected to the real database and tested in the browser.

Work was organised into short development cycles. Each cycle started by selecting a small group of requirements, continued through implementation and database integration, and ended with verification. The project checklist was used as a lightweight backlog. Features were not considered complete merely because code existed; they were checked through TypeScript validation, automated tests, browser workflows, data-preservation checks, and production-build validation.

The methodology used the following cycle:

1. **Requirement analysis:** identify the user role, business rule, data involved, and expected outcome.
2. **Design:** decide the route, interface state, tRPC procedure, validation rules, and database changes.
3. **Implementation:** build the client component, server procedure, database helper, and storage integration where required.
4. **Verification:** run tests and type checking, then exercise the feature through a realistic browser workflow.
5. **Release and review:** publish the verified change, inspect the managed deployment, and record the result in the project checklist.

This approach was especially important during migration. Existing SQL data had to be preserved while the schema was adapted for the managed MySQL-compatible database. The migration therefore used non-destructive reconciliation, compatibility repairs, managed storage for large media files, and repeated checks that imported records remained available.

## 9. Project timebox

The timebox starts on **13 September 2026**. The dates below describe the planned sequence of work and the evidence produced during each stage.

| Period | Main work | Expected evidence |
|---|---|---|
| 13–15 September | Confirm project objectives, users, requirements, scope, and existing source structure | Approved feature list, role definitions, initial risk notes |
| 16–20 September | Analyse the existing SQL data and design the relational model | Schema review, data inventory, ERD, migration plan |
| 21–27 September | Establish the managed application, database connection, authentication, and base routing | Running full-stack baseline and database connectivity check |
| 28 September–4 October | Implement public pages, vacancy search, company directory, and career-tip display | Public browsing workflow and responsive page checks |
| 5–11 October | Implement job-seeker registration, profiles, media upload, and applications | Candidate workflow tests and managed-storage verification |
| 12–18 October | Implement company registration, approval, vacancy management, and applicant review | Employer workflow tests and moderation-state checks |
| 19–23 October | Implement administrator management, reviews, notifications, messaging, settings, and audit logs | Admin workflow checks and activity evidence |
| 24–27 October | Complete Contact delivery, profile-photo cropping, data reconciliation, and branding corrections | End-to-end feature verification and preserved-data comparison |
| 28–30 October | Run regression tests, type checking, build validation, security/data-protection review, and deployment smoke tests | Release checklist, test results, production build, deployment verification |
| 31 October–2 November | Final documentation, screenshots, reflection, and coursework packaging | README, ERD explanation, proposal sections, and final report material |

The timebox is a planning and documentation aid. It does not claim that every task was completed on the exact day shown; it records a defensible order for analysis, construction, testing, release, and coursework preparation.

## 10. Testing and quality assurance

The project uses Vitest for automated tests and the TypeScript compiler for static validation. Browser-based checks were also used for high-value workflows, including public vacancy search, job-seeker registration and application submission, company approval and vacancy management, the Contact form, managed media upload, square photo cropping, and authenticated profile persistence.

Before release, the project was checked for:

- TypeScript errors with `pnpm check`.
- Automated test failures with `pnpm test`.
- Production build failures with `pnpm build`.
- Database read/write compatibility against the managed database.
- Preservation of imported companies, reviews, jobs, applications, messages, notifications, and valid media.
- Public-data protection so unauthenticated company queries do not expose credentials or private contact fields.
- Correct storage of new profile photos, company logos, and résumé files through managed storage.
- Correct role and status handling for administrators, job seekers, companies, jobs, and applications.

## 11. Installation and local development

The project requires Node.js and pnpm. After cloning the repository, install dependencies with:

```bash
pnpm install
```

Create the required environment configuration through the hosting platform or a local environment file. Do not commit secrets. The application uses a MySQL-compatible `DATABASE_URL`, session secrets, managed OAuth values, and storage/runtime values supplied by the deployment environment.

Start the development server with:

```bash
pnpm dev
```

Run the main validation commands with:

```bash
pnpm check
pnpm test
pnpm build
```

Database schema generation and migration are handled by:

```bash
pnpm db:push
```

The repository also contains project-specific seed and restoration scripts. These should only be run against an explicitly selected database and should be reviewed before use, because restoration is intended to preserve and reconcile project data rather than to erase a live database.

## 12. Repository structure

```text
client/
  src/
    admin/             Administrator routes and pages
    components/        Reusable layout and UI components
    pages/             Public, company, and job-seeker pages
    contexts/          Theme and application contexts
    hooks/             Reusable client hooks
    lib/               tRPC client and shared utilities
  public/              Small public configuration assets
server/
  _core/               Runtime, OAuth, storage, and server infrastructure
  db.ts                Database helpers
  routers.ts           Typed tRPC procedures
  storage.ts           Managed file-storage helpers
drizzle/
  schema.ts            Relational schema and inferred types
  migrations/          Database migration history
shared/                Shared constants and types
patches/               Required dependency patches
vitest.config.ts       Test configuration
vite.config.ts         Frontend and development-server configuration
package.json           Scripts and dependencies
```

## 13. Deployment

The deployed site is available at:

**https://talenthub-gkbobftg.manus.space**

The managed deployment provides the application runtime, MySQL-compatible database, S3-compatible storage integration, OAuth/runtime configuration, and public hosting. The GitHub source repository is `daniel0979/talentbridgehub`, and the verified project state was synchronised to its `main` branch.

## 14. Limitations and future improvements

Several improvements would be suitable for a future release. The platform could add richer search ranking, saved vacancies, password-reset email delivery managed inside the application, candidate–company messaging, interview scheduling, résumé parsing, automated moderation assistance, stronger rate limiting, more granular permissions, and a dedicated mobile client. These are future improvements rather than missing prerequisites for the current project scope.

## 15. Related coursework files

- [Entity Relationship Diagram and explanation](docs/ERD.md)
- [Project proposal sections, methodology, scope, and timebox](docs/project-proposal.md)

## References

[1]: https://react.dev/ "React documentation"
[2]: https://vite.dev/ "Vite documentation"
[3]: https://trpc.io/ "tRPC documentation"
[4]: https://orm.drizzle.team/ "Drizzle ORM documentation"
[5]: https://www.mysql.com/ "MySQL documentation and product information"
[6]: https://tailwindcss.com/ "Tailwind CSS documentation"
[7]: https://vitest.dev/ "Vitest documentation"
[8]: https://expressjs.com/ "Express documentation"
[9]: https://www.radix-ui.com/primitives "Radix UI primitives documentation"
[10]: https://formsubmit.co/ "FormSubmit documentation"

The references describe the principal technologies used by the project. The authoritative implementation details for TalentBridgeHub are the source files, database schema, tests, and deployment configuration in this repository.
