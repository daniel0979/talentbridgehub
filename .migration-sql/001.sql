CREATE TABLE `career_tips` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `cover_image` varchar(512) DEFAULT NULL,
  `status` enum('draft','published') NOT NULL DEFAULT 'draft',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `category` varchar(255) NOT NULL DEFAULT 'Career Growth',
  `read_time` varchar(64) NOT NULL DEFAULT '5 min read',
  `excerpt` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT INTO `career_tips` (`id`, `title`, `body`, `cover_image`, `status`, `createdAt`, `updatedAt`, `category`, `read_time`, `excerpt`) VALUES
(1, 'Craft a Resume That Gets Noticed', '[\"Most recruiters spend under 10 seconds on a first resume scan, so the top third of your page needs to do the heavy lifting. Lead with a short summary that states your role, years of experience, and one standout achievement.\",\"Swap generic duty-based bullet points for outcome-based ones. Instead of \\\"responsible for managing social media,\\\" write \\\"grew social engagement by 40% in six months.\\\"\",\"Tailor your resume for each application by mirroring key phrases from the job description — many companies still filter resumes through keyword-based applicant tracking systems before a human ever sees them.\"]', NULL, 'published', '2026-08-06 09:03:34', '2026-08-06 09:03:34', 'Career Growth', '5 min read', 'Learn how to structure your resume so hiring managers stop scrolling and start reading.');
CREATE TABLE `companies` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `logo_url` longtext DEFAULT NULL,
  `description` text DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `owner_email` varchar(320) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `contact_name` varchar(255) DEFAULT NULL,
  `phone` varchar(64) DEFAULT NULL,
  `industry` varchar(255) DEFAULT NULL,
  `town` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','suspended') NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT INTO `companies` (`id`, `name`, `logo_url`, `description`, `website`, `createdAt`, `updatedAt`, `owner_email`, `password`, `contact_name`, `phone`, `industry`, `town`, `status`) VALUES
(1, 'TechNova', NULL, 'Innovative software company building cloud-native solutions.', 'https://technova.com', '2026-08-04 03:27:58', '2026-08-04 03:27:58', NULL, NULL, NULL, NULL, NULL, NULL, 'pending'),
(2, 'DesignWorks', NULL, 'Creative design agency crafting memorable brand experiences.', 'https://designworks.com', '2026-08-04 03:27:58', '2026-08-04 03:27:58', NULL, NULL, NULL, NULL, NULL, NULL, 'pending'),
(3, 'FinEdge', NULL, 'Financial technology firm delivering modern banking tools.', 'https://finedge.com', '2026-08-04 03:27:58', '2026-08-04 03:27:58', NULL, NULL, NULL, NULL, NULL, NULL, 'pending'),
(4, 'MarketSphere', NULL, 'Data-driven marketing agency for growth-focused brands.', 'https://marketsphere.com', '2026-08-04 03:27:58', '2026-08-04 03:27:58', NULL, NULL, NULL, NULL, NULL, NULL, 'pending'),
(5, 'BuildRight', NULL, 'Construction and engineering company with a global footprint.', 'https://buildright.com', '2026-08-04 03:27:58', '2026-08-04 03:27:58', NULL, NULL, NULL, NULL, NULL, NULL, 'pending'),
(6, 'HealthPlus', NULL, 'Healthcare provider dedicated to patient-first care.', 'https://healthplus.com', '2026-08-04 03:27:58', '2026-08-07 06:35:26', NULL, NULL, NULL, NULL, NULL, NULL, 'suspended'),
(7, 'KMD College', NULL, 'Originally founded in 1986 as a niche computer training institute, KMD has grown into the largest one-stop Information and Communication Technology (ICT) products, education, and services provider', 'https://kmd.edu.mm/', '2026-08-05 07:13:58', '2026-08-05 07:13:58', 'kmd@gmail.com', '$2b$10$IOsJ8W4zBbGZEBI9j5XPeOXApZmj1wRLRYciKNfBoKEp./K1tygqS', 'KMD College', '097843283992', 'Technology', 'YGN', 'approved');
INSERT INTO `companies` (`id`, `name`, `logo_url`, `description`, `website`, `createdAt`, `updatedAt`, `owner_email`, `password`, `contact_name`, `phone`, `industry`, `town`, `status`) VALUES
(8, 'Tech Khit', NULL, 'Tech Khit helps Australian businesses simplify operations through business systems, websites, applications, bookkeeping, data entry, administration, creative services and AI-human integrated workflows.', 'https://techkhit.com.au/', '2026-08-07 04:25:29', '2026-08-07 04:45:20', 'techkhit@gmail.com', '$2b$10$Je.Y5NYeQ.MGTqdFKv6z4e/bQTgbNlpqIOa66jNXUS4WEKzgwsGX.', 'Tech Khit', '09874783998', 'Marketing', 'Yangon', 'approved');
INSERT INTO `companies` (`id`, `name`, `logo_url`, `description`, `website`, `createdAt`, `updatedAt`, `owner_email`, `password`, `contact_name`, `phone`, `industry`, `town`, `status`) VALUES
(9, 'Tech Khit AU', NULL, 'Tech Khit helps Australian businesses simplify operations through business systems, websites, applications, bookkeeping, data entry, administration, creative services and AI-human integrated workflows.', 'https://techkhit.com.au/', '2026-08-07 04:27:04', '2026-08-07 08:56:31', 'techkhitau@gmail.com', '$2b$10$iJmaD7PnLlwFdwmg7O0t2ekoFU1x2bfBWOFHVrqkdpprqTHQwSiy.', 'Mr.Zico Ria', '09874783928', 'Marketing', 'Australia', 'approved');
INSERT INTO `companies` (`id`, `name`, `logo_url`, `description`, `website`, `createdAt`, `updatedAt`, `owner_email`, `password`, `contact_name`, `phone`, `industry`, `town`, `status`) VALUES
(10, 'Samsung', NULL, 'Samsung is a South Korean multinational manufacturing conglomerate headquartered in Samsung Town, Seoul. As the world\'s largest family-controlled conglomerate (chaebol), its pinnacle electronics division, Samsung Electronics.', 'https://www.samsung.com/', '2026-08-07 07:06:41', '2026-08-07 07:06:55', 'samsung@gmail.com', '$2b$10$.Ts4U3nwD09F1T.vd/Zpcu8WOPWxU6fjDh.xf65xPc2SEQUdTmWFm', 'Samsung', '09723173992', 'Marketing', 'Yangon', 'approved'),
(11, 'Apple', NULL, 'Apple iOS is the proprietary mobile operating system created by Apple for its iPhone lineup. First unveiled alongside the original iPhone in 2007, it has evolved into the world\'s second most popular mobile platform. The current stable version is iOS 26, which aligned Apple\'s version numbers with the calendar year. The upcoming major release, iOS 27, is heavily integrated with advanced AI and is currently undergoing beta testing ahead of its general launch later this year.', 'https://www.apple.com', '2026-08-07 09:29:58', '2026-08-07 09:30:10', 'apple@gmail.com', '$2b$10$fBb3PoMaeZxrpWdnoAx58O3z0/rtw0qDUocwHuyJRVx6.ibklbSc.', 'Apple', '09384329334', 'Technology', 'Thai', 'approved');
CREATE TABLE `company_reviews` (
  `id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `content` text NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `conversations` (
  `id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT INTO `conversations` (`id`, `company_id`, `createdAt`, `updatedAt`) VALUES
(1, 7, '2026-08-06 07:55:04', '2026-08-06 07:55:04'),
(2, 8, '2026-08-07 06:58:40', '2026-08-07 06:58:40');
CREATE TABLE `jobs` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `company_id` int(11) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `job_type` varchar(255) DEFAULT NULL,
  `salary_range` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `posted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `salary_band_id` int(11) DEFAULT NULL,
  `application_count` int(11) NOT NULL DEFAULT 0,
  `responsibilities` text DEFAULT NULL,
  `requirements` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT INTO `jobs` (`id`, `title`, `company_id`, `location`, `job_type`, `salary_range`, `description`, `category_id`, `posted_at`, `createdAt`, `updatedAt`, `status`, `salary_band_id`, `application_count`, `responsibilities`, `requirements`) VALUES
(13, 'Network Engineer', 7, 'Yangon', 'Full-time', '800k', 'Need a network engineer.', 1, '2026-08-05 08:51:11', '2026-08-05 08:51:11', '2026-08-07 03:41:22', 'approved', NULL, 1, NULL, NULL),
(14, 'Customer Service', 8, 'Yangon', 'Full-time', '700k', '\"Join our growing customer support team as a Customer Service Representative! You\'ll be the first point of contact for our customers, handling inquiries via phone, email, and live chat with professionalism and care. We\'re looking for someone with excellent communication skills, a problem-solving mindset, and the patience to turn frustrated customers into loyal ones. No prior experience required — just a positive attitude and willingness to learn. In return, we offer comprehensive training, a supportive team environment, and clear paths for career growth within the company', 3, '2026-08-07 04:47:11', '2026-08-07 04:47:11', '2026-08-07 05:00:14', 'approved', NULL, 0, NULL, NULL),
(15, 'Frontend Engineer', 8, 'Yangon', 'Full-time', '700k', 'We\'re looking for a Senior Frontend Engineer to lead the development of our customer-facing web applications. You\'ll work closely with designers and backend engineers to build responsive, accessible interfaces using React and TypeScript. Requirements include 5+ years of frontend experience, strong knowledge of modern JavaScript frameworks, and experience mentoring junior developers.', 1, '2026-08-07 05:08:24', '2026-08-07 05:08:24', '2026-08-07 05:12:05', 'approved', NULL, 0, NULL, NULL),
(16, 'Marketing Coordinator', 8, 'Yangon', 'Full-time', '900k', 'Support our marketing team in planning and executing campaigns across social media, email, and content channels. Responsibilities include scheduling content, tracking campaign performance, and coordinating with designers. Ideal candidates have 1-2 years of marketing experience and strong organizational skills.', 3, '2026-08-07 05:11:59', '2026-08-07 05:11:59', '2026-08-07 05:12:04', 'approved', NULL, 0, NULL, NULL),
(17, 'Warehouse Associate', 8, 'Yangon', 'Part-time', '600k', 'Handle receiving, sorting, and shipping of inventory in a fast-paced warehouse environment. Duties include operating pallet jacks, maintaining accurate stock records, and following safety protocols. No experience necessary — training provided.', 3, '2026-08-07 06:33:37', '2026-08-07 06:33:37', '2026-08-07 06:33:46', 'approved', NULL, 0, NULL, NULL),
(18, 'Graphic Designer', 8, 'Yangon', 'Full-time', '890k', 'Create visually compelling designs for digital and print materials, including social media graphics, brochures, and branding assets. Must have a strong portfolio, proficiency in Adobe Creative Suite, and the ability to work independently on tight deadlines.', 2, '2026-08-07 06:41:28', '2026-08-07 06:41:28', '2026-08-07 06:41:47', 'approved', NULL, 0, NULL, NULL),
(19, 'Financial Analyst', 8, 'Yangon', 'Full-time', '800k', 'Analyze financial data to support business decisions, prepare forecasts, and build reporting models. Requires a bachelor\'s degree in Finance or related field, strong Excel skills, and 2+ years of experience in financial analysis or accounting.', 4, '2026-08-07 06:46:34', '2026-08-07 06:46:34', '2026-08-07 06:46:38', 'approved', NULL, 0, NULL, NULL),
(20, 'Software Engineer', 10, 'Yangon', 'Full-time', '1M', 'Join Samsung\'s mobile division to design and develop software features for our next generation of smartphones. You\'ll work on performance optimization, OS-level integrations, and collaborate with global hardware teams. Requires a strong background in Java/Kotlin or C++, experience with Android internals, and a degree in Computer Science or related field.', 5, '2026-08-07 07:08:20', '2026-08-07 07:08:20', '2026-08-07 07:08:25', 'approved', NULL, 0, NULL, NULL),
(21, 'Product Marketing Manager', 10, 'Yangon', 'Full-time', '2M', 'Lead go-to-market strategy for a portfolio of Samsung consumer electronics products. Responsibilities include market research, competitive analysis, campaign planning, and coordinating cross-functional launches with sales and design teams. Requires 4+ years of product marketing experience, ideally in consumer tech.', 3, '2026-08-07 07:09:18', '2026-08-07 07:09:18', '2026-08-07 07:09:22', 'approved', NULL, 0, NULL, NULL),
(22, 'Supply Chain Analyst', 10, 'Mandalay', 'Full-time', '800k', 'Support demand planning and inventory optimization across Samsung\'s semiconductor and electronics supply chain. Analyze forecasting data, identify process improvements, and collaborate with manufacturing and logistics partners. Requires strong analytical skills and proficiency in Excel/SQL; supply chain experience preferred.', 1, '2026-08-07 07:10:10', '2026-08-07 07:10:10', '2026-08-07 07:10:19', 'approved', NULL, 0, NULL, NULL),
(23, 'UI/UX Designer', 10, 'Naypyidaw', 'Full-time', '800k', 'Design intuitive, visually engaging interfaces for Samsung\'s mobile and smart device ecosystem. Collaborate with product managers and engineers to translate user needs into polished experiences, from wireframes to high-fidelity prototypes. Requires a strong portfolio, proficiency in Figma, and 3+ years of UX/UI design experience.', 2, '2026-08-07 07:11:15', '2026-08-07 07:11:15', '2026-08-07 07:11:19', 'approved', NULL, 0, NULL, NULL),
(24, 'Web Developer', 9, 'Remote', 'Full-time', '900k', 'Tech Khit Au is looking for a Web Developer to join our growing team building and maintaining digital solutions for clients across various industries. You\'ll work on responsive websites, custom web applications, and integrations, collaborating closely with our design and project teams. Requirements include solid experience with HTML, CSS, JavaScript, and at least one modern framework (React, Vue, or similar), plus strong communication skills for client-facing work.', 1, '2026-08-07 08:59:46', '2026-08-07 08:59:46', '2026-08-07 08:59:52', 'approved', NULL, 0, '[\"Build and maintain responsive websites and custom web applications for clients across various industries\",\"Collaborate with designers to translate mockups into functional, pixel-accurate interfaces\",\"Integrate third-party APIs and services as needed for client projects\",\"Troubleshoot and fix bugs across existing client websites\",\"Participate in code reviews and follow team coding standards\"]', '[\"Solid experience with HTML, CSS, and JavaScript\",\"Proficiency in at least one modern framework (React, Vue, or similar)\",\"Understanding of responsive design and cross-browser compatibility\",\"Strong communication skills for client-facing work\",\"Prior freelance or agency experience is a plus\"]'),
(25, 'Digital Project Manager', 9, 'Remote', 'Full-time', '1M', 'Manage the delivery of web and digital projects from kickoff to launch, coordinating between clients, designers, and developers. Responsibilities include timeline management, client communication, and ensuring projects stay on budget and scope. Requires 3+ years of experience managing digital/web projects, strong organizational skills, and familiarity with agile workflows.', 3, '2026-08-07 09:26:55', '2026-08-07 09:26:55', '2026-08-07 09:27:36', 'approved', NULL, 0, '[\"Manage web and digital projects from kickoff through delivery\",\"Act as the primary point of contact between clients, designers, and developers\",\"Create and maintain project timelines, ensuring deadlines and budgets are met\",\"Facilitate stand-ups, sprint planning, and other agile ceremonies\",\"Identify and resolve project risks or scope changes early\"]', '[\"3+ years of experience managing digital or web projects\",\"Strong organizational and time-management skills\",\"Familiarity with agile/scrum workflows and tools (Jira, Trello, or similar)\",\"Excellent written and verbal communication skills\",\"Ability to manage multiple client projects simultaneously\"]');
CREATE TABLE `job_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT INTO `job_categories` (`id`, `name`, `icon`, `createdAt`, `updatedAt`) VALUES
(1, 'Technology', 'Code', '2026-08-04 03:27:58', '2026-08-04 03:27:58'),
(2, 'Design', 'Palette', '2026-08-04 03:27:58', '2026-08-04 03:27:58'),
(3, 'Marketing', 'Megaphone', '2026-08-04 03:27:58', '2026-08-04 03:27:58'),
(4, 'Finance', 'DollarSign', '2026-08-04 03:27:58', '2026-08-04 03:27:58'),
(5, 'Engineering', 'Wrench', '2026-08-04 03:27:58', '2026-08-04 03:27:58'),
(6, 'Healthcare', 'HeartPulse', '2026-08-04 03:27:58', '2026-08-04 03:27:58'),
(7, 'Sales', 'TrendingUp', '2026-08-04 03:27:58', '2026-08-04 03:27:58'),
(8, 'Education', 'GraduationCap', '2026-08-04 03:27:58', '2026-08-04 03:27:58'),
(9, 'Human Resources', 'Users', '2026-08-04 03:27:58', '2026-08-04 03:27:58'),
(10, 'Customer Support', 'Headphones', '2026-08-04 03:27:58', '2026-08-04 03:27:58');
CREATE TABLE `job_seekers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(320) NOT NULL,
  `phone` varchar(64) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `headline` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `resume_url` varchar(512) DEFAULT NULL,
  `status` enum('active','suspended') NOT NULL DEFAULT 'active',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `password` varchar(255) NOT NULL,
  `skills` text DEFAULT NULL,
  `photo_url` longtext DEFAULT NULL,
  `desired_category` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT INTO `job_seekers` (`id`, `name`, `email`, `phone`, `location`, `headline`, `bio`, `resume_url`, `status`, `createdAt`, `updatedAt`, `password`, `skills`, `photo_url`, `desired_category`) VALUES
(1, 'Test User Updated', 'testuser@example.com', NULL, 'Yangon', 'Senior Frontend Engineer', 'I build web apps', NULL, 'active', '2026-08-04 10:46:21', '2026-08-04 10:50:41', '$2b$10$oPo43QheUGYBpKSGTmP9QeZaMTwPEltuPdqAoZESg9aHMy5n.qNN6', '[\"React\",\"TypeScript\",\"Node.js\"]', NULL, 'Technology'),
(2, 'Daniel', 'daniel@gmail.com', NULL, 'Yangon, Myanmar', 'Full Stack Developer', 'I have the great passion to work and never let you down.', NULL, 'active', '2026-08-05 03:23:26', '2026-08-06 10:15:05', '$2b$10$j.PuGAD.1LGLKxrC.lMwN.N54H9HhbT53JPEocYZNNxuxkJI9mV5O', NULL, NULL, NULL),
(3, 'Daniel', 'daniel2@gmail.com', NULL, NULL, NULL, NULL, NULL, 'active', '2026-08-05 04:17:55', '2026-08-05 04:17:55', '$2b$10$8xvYVdA3eskPAWz91/sj5./7SgHCNj8bD2AU/QEljUJgkrq0Ivl7O', NULL, NULL, NULL);
INSERT INTO `job_seekers` (`id`, `name`, `email`, `phone`, `location`, `headline`, `bio`, `resume_url`, `status`, `createdAt`, `updatedAt`, `password`, `skills`, `photo_url`, `desired_category`) VALUES
(4, 'Testing 1', 'testing1@gmail.com', NULL, 'Yangon', 'Network Engineer', 'hire me to destroy your network.', NULL, 'active', '2026-08-05 04:31:57', '2026-08-05 04:33:00', '$2b$10$NTHorTveV2m79bsyXeDQOOw2r/yJ6skeraR.eP5vAIG5tqF3CPjpu', '[\"Network\"]', NULL, 'Technology');
INSERT INTO `job_seekers` (`id`, `name`, `email`, `phone`, `location`, `headline`, `bio`, `resume_url`, `status`, `createdAt`, `updatedAt`, `password`, `skills`, `photo_url`, `desired_category`) VALUES
(5, 'Jinny', 'jinny@gmail.com', NULL, 'Yangon', 'Developer', 'Best Extrovert you need in your company.', NULL, 'active', '2026-08-07 04:56:30', '2026-08-07 04:57:37', '$2b$10$EqkPUo3WmN4/hMTP1U4UlOrHD22ueq6gsprEV/KCVQWXrxRLN17Y6', NULL, NULL, 'Technology');
CREATE TABLE `job_seeker_reviews` (
  `id` int(11) NOT NULL,
  `job_seeker_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `content` text NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `locations` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT INTO `locations` (`id`, `name`, `sort_order`, `createdAt`, `updatedAt`) VALUES
(1, 'Remote', 0, '2026-08-04 07:03:43', '2026-08-04 07:03:43'),
(2, 'Yangon', 1, '2026-08-04 07:03:43', '2026-08-07 06:42:41'),
(3, 'Mandalay', 2, '2026-08-04 07:03:43', '2026-08-07 06:42:48'),
(4, 'Thanlyin', 3, '2026-08-04 07:03:43', '2026-08-07 06:42:59'),
(5, 'Shan', 4, '2026-08-04 07:03:43', '2026-08-07 06:43:08'),
(6, 'Naypyidaw', 5, '2026-08-04 07:03:43', '2026-08-07 06:43:32'),
(7, 'Taung Gyi', 6, '2026-08-04 07:03:43', '2026-08-07 06:44:02'),
(8, 'Mawlamyine', 7, '2026-08-04 07:03:43', '2026-08-07 06:45:11'),
(9, 'Sittwe', 8, '2026-08-04 07:03:43', '2026-08-07 06:45:34');
CREATE TABLE `messages` (
`id` int(11) NOT NULL,
  `conversation_id` int(11) NOT NULL,
  `sender` enum('admin','company') NOT NULL,
  `body` text NOT NULL,
  `read` enum('unread','read') NOT NULL DEFAULT 'unread',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `recipientRole` enum('admin','job_seeker','company') NOT NULL,
  `recipient_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `type` enum('password_reset','application','system') NOT NULL DEFAULT 'system',
  `is_read` enum('unread','read') NOT NULL DEFAULT 'unread',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT INTO `messages` (`id`, `conversation_id`, `sender`, `body`, `read`, `createdAt`) VALUES
(1, 1, 'admin', 'hi', 'read', '2026-08-06 07:55:08'),
(2, 1, 'company', 'hi', 'read', '2026-08-07 03:56:05');
CREATE TABLE `partner_companies` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `logo` varchar(512) DEFAULT NULL,
  `testimonial_quote` text DEFAULT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `salary_bands` (
  `id` int(11) NOT NULL,
  `label` varchar(255) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `settings` (
  `id` int(11) NOT NULL,
  `key` varchar(255) NOT NULL,
  `value` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT INTO `settings` (`id`, `key`, `value`, `createdAt`, `updatedAt`) VALUES
(1, 'site_name', 'TalentBridge Hub', '2026-08-04 07:03:43', '2026-08-04 07:03:43'),
(2, 'contact_email', 'contact@talentbridgehub.com', '2026-08-04 07:03:43', '2026-08-04 07:03:43'),
(3, 'maintenance_enabled', 'false', '2026-08-06 09:40:33', '2026-08-06 09:43:05'),
(4, 'maintenance_updated_at', '2026-08-06T09:43:05.156Z', '2026-08-06 09:40:33', '2026-08-06 09:43:05'),
(5, 'maintenance_message', 'Shutdown for a minute.', '2026-08-06 09:40:33', '2026-08-06 09:40:33');
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activity_logs_admin_id_admins_id_fk` (`admin_id`);
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `admins_email_unique` (`email`);
ALTER TABLE `applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `applications_job_seeker_id_job_seekers_id_fk` (`job_seeker_id`),
  ADD KEY `applications_job_id_jobs_id_fk` (`job_id`),
  ADD KEY `applications_company_id_companies_id_fk` (`company_id`);
ALTER TABLE `career_tips`
  ADD PRIMARY KEY (`id`);
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`);
ALTER TABLE `company_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_reviews_company_id_companies_id_fk` (`company_id`);
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `conversations_company_id_unique` (`company_id`),
  ADD KEY `conversations_company_id_companies_id_fk` (`company_id`);
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_company_id_companies_id_fk` (`company_id`),
  ADD KEY `jobs_category_id_job_categories_id_fk` (`category_id`);
ALTER TABLE `job_categories`
  ADD PRIMARY KEY (`id`);
ALTER TABLE `job_seekers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `job_seekers_email_unique` (`email`);
ALTER TABLE `job_seeker_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `job_seeker_reviews_job_seeker_id_job_seekers_id_fk` (`job_seeker_id`);
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`);
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `messages_conversation_id_conversations_id_fk` (`conversation_id`);
ALTER TABLE `partner_companies`
  ADD PRIMARY KEY (`id`);
ALTER TABLE `salary_bands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `salary_bands_label_unique` (`label`);
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `settings_key_unique` (`key`);
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
ALTER TABLE `applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
ALTER TABLE `career_tips`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
ALTER TABLE `companies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;
ALTER TABLE `company_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
ALTER TABLE `conversations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
ALTER TABLE `jobs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;
ALTER TABLE `job_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
ALTER TABLE `job_seekers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
ALTER TABLE `job_seeker_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
ALTER TABLE `locations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
ALTER TABLE `partner_companies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `salary_bands`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_admin_id_admins_id_fk` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE `applications`
  ADD CONSTRAINT `applications_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `applications_job_id_jobs_id_fk` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `applications_job_seeker_id_job_seekers_id_fk` FOREIGN KEY (`job_seeker_id`) REFERENCES `job_seekers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE `company_reviews`
  ADD CONSTRAINT `company_reviews_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE `conversations`
  ADD CONSTRAINT `conversations_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE `jobs`
  ADD CONSTRAINT `jobs_category_id_job_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `job_categories` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `jobs_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE `job_seeker_reviews`
  ADD CONSTRAINT `job_seeker_reviews_job_seeker_id_job_seekers_id_fk` FOREIGN KEY (`job_seeker_id`) REFERENCES `job_seekers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_conversation_id_conversations_id_fk` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
