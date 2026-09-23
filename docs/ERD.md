# TalentBridgeHub Entity Relationship Diagram

## Purpose

This document explains the relational data model used by TalentBridgeHub. The model supports three operational roles: job seekers, companies, and administrators. It also supports public vacancy discovery, applications, moderation, reviews, notifications, messaging, career content, and site configuration.

## Diagram

```mermaid
erDiagram
    USERS {
        int id PK
        varchar openId UK
        enum role
    }
    ADMINS {
        bigint id PK
        varchar email UK
        enum role
        enum status
    }
    JOB_SEEKERS {
        bigint id PK
        varchar email UK
        enum status
    }
    COMPANIES {
        bigint id PK
        varchar name
        varchar owner_email
        enum status
    }
    COMPANY_REVIEWS {
        bigint id PK
        bigint company_id FK
        int rating
    }
    JOB_SEEKER_REVIEWS {
        bigint id PK
        bigint job_seeker_id FK
        int rating
    }
    JOB_CATEGORIES {
        bigint id PK
        varchar name
    }
    LOCATIONS {
        bigint id PK
        varchar name
    }
    SALARY_BANDS {
        bigint id PK
        varchar label UK
    }
    JOBS {
        bigint id PK
        bigint company_id FK
        bigint category_id FK
        bigint salary_band_id FK
        enum status
    }
    APPLICATIONS {
        bigint id PK
        bigint job_seeker_id FK
        bigint job_id FK
        bigint company_id FK
        enum status
    }
    CAREER_TIPS {
        bigint id PK
        enum status
    }
    CONVERSATIONS {
        bigint id PK
        bigint company_id FK UK
    }
    MESSAGES {
        bigint id PK
        bigint conversation_id FK
        enum sender
    }
    PARTNER_COMPANIES {
        bigint id PK
        varchar name
    }
    ACTIVITY_LOGS {
        bigint id PK
        bigint admin_id FK
        varchar target_type
        bigint target_id
    }
    NOTIFICATIONS {
        bigint id PK
        enum recipientRole
        bigint recipient_id
    }
    SETTINGS {
        bigint id PK
        varchar key UK
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

## Relationship details

### Accounts

`job_seekers`, `companies`, and `admins` are separate account tables because they have different fields, authentication paths, permissions, and lifecycle states. The `users` table supports the managed OAuth identity used by the runtime and is not a replacement for the role-specific account records.

### Companies and jobs

One company can publish many jobs. Each job belongs to one company through `jobs.company_id`. A new company and a new job can remain pending until an administrator approves them. A job can optionally reference a job category and salary band. The current schema stores the selected location as text, while the `locations` table provides managed values for the interface filters.

### Applications

An application joins a job seeker to a job and its owning company. Storing `company_id` on the application makes company-side queries direct and preserves the employer associated with the application at submission time. The status field models the application lifecycle: submitted, reviewed, shortlisted, interview, offered, or rejected.

### Reviews

Company reviews and job-seeker reviews use different tables. This avoids confusing the subject of a review and allows the public interface to present employer testimonials separately from job-seeker success stories.

### Conversations and messages

A company has at most one administrator conversation because `conversations.company_id` is unique. A conversation can contain multiple messages. Each message records whether it was sent by the administrator or the company and whether it has been read.

### Audit logs and notifications

An activity log has a direct foreign key to the administrator who performed the action. Its target is represented by `target_type` and `target_id`, which allows one log structure to describe actions involving different table types. Notifications use `recipientRole` and `recipientId` because they can target an administrator, job seeker, or company. These are intentional application-level polymorphic references.

### Supporting content

`career_tips` stores draft or published career content. `partner_companies` stores the smaller curated set shown in the public partner section and is separate from registered companies. `settings` provides unique site-wide configuration keys. `locations`, `job_categories`, and `salary_bands` provide managed reference values for vacancy creation and search.

## Design considerations

The schema prioritises referential integrity for the central recruitment workflow. Foreign keys connect companies to jobs, job seekers to applications, jobs to applications, and conversations to messages. Media bytes are not intended to be stored in ordinary database fields during normal operation; profile photographs, logos, and résumé files are uploaded to managed storage and referenced by a URL or storage path. Legacy imported data is supported for compatibility, but new uploads follow the managed-storage workflow.

The model also separates public information from private account information at the query layer. Public company results should expose only the fields needed for a directory or profile page. Passwords, private account fields, and session information must not be returned by unauthenticated procedures.

## References

[1]: https://orm.drizzle.team/ "Drizzle ORM documentation"
[2]: https://www.mysql.com/ "MySQL documentation and product information"
