CREATE TABLE `company_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `rating` int NOT NULL,
  `content` text NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `company_reviews_company_id_companies_id_fk` (`company_id`),
  CONSTRAINT `company_reviews_company_id_companies_id_fk`
    FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
    ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
