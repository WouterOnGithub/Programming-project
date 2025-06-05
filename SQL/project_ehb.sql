-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 05, 2025 at 03:08 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `project_ehb`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `admin_id` int(11) NOT NULL,
  `naam` varchar(100) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `wachtwoord_hash` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bedrijf`
--

CREATE TABLE `bedrijf` (
  `bedrijf_id` int(11) NOT NULL,
  `naam` varchar(100) NOT NULL,
  `sector` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `locatie` varchar(100) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `logo` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bericht`
--

CREATE TABLE `bericht` (
  `bericht_id` int(11) NOT NULL,
  `favoriet_id` int(11) DEFAULT NULL,
  `verzender_type` enum('student','bedrijf') DEFAULT NULL,
  `inhoud` text NOT NULL,
  `tijdstip` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `favoriet`
--

CREATE TABLE `favoriet` (
  `favoriet_id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `job_id` int(11) DEFAULT NULL,
  `datum_favoriet` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job`
--

CREATE TABLE `job` (
  `job_id` int(11) NOT NULL,
  `bedrijf_id` int(11) DEFAULT NULL,
  `titel` varchar(100) DEFAULT NULL,
  `beschrijving` text DEFAULT NULL,
  `job_type` enum('stage','studentenjob','voltijds') DEFAULT NULL,
  `locatie` varchar(100) DEFAULT NULL,
  `publicatiedatum` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

CREATE TABLE `student` (
  `student_id` int(11) NOT NULL,
  `voornaam` varchar(50) DEFAULT NULL,
  `achternaam` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `linkedin_profiel` varchar(255) DEFAULT NULL,
  `opleiding` varchar(100) DEFAULT NULL,
  `afstudeerjaar` int(11) DEFAULT NULL,
  `profiel_foto` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `swipe`
--

CREATE TABLE `swipe` (
  `swipe_id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `job_id` int(11) DEFAULT NULL,
  `richting` enum('like','dislike') DEFAULT NULL,
  `datum` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `bedrijf`
--
ALTER TABLE `bedrijf`
  ADD PRIMARY KEY (`bedrijf_id`);

--
-- Indexes for table `bericht`
--
ALTER TABLE `bericht`
  ADD PRIMARY KEY (`bericht_id`),
  ADD KEY `favoriet_id` (`favoriet_id`);

--
-- Indexes for table `favoriet`
--
ALTER TABLE `favoriet`
  ADD PRIMARY KEY (`favoriet_id`),
  ADD UNIQUE KEY `student_id` (`student_id`,`job_id`),
  ADD KEY `job_id` (`job_id`);

--
-- Indexes for table `job`
--
ALTER TABLE `job`
  ADD PRIMARY KEY (`job_id`),
  ADD KEY `bedrijf_id` (`bedrijf_id`);

--
-- Indexes for table `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`student_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `swipe`
--
ALTER TABLE `swipe`
  ADD PRIMARY KEY (`swipe_id`),
  ADD UNIQUE KEY `student_id` (`student_id`,`job_id`),
  ADD KEY `job_id` (`job_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bedrijf`
--
ALTER TABLE `bedrijf`
  MODIFY `bedrijf_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bericht`
--
ALTER TABLE `bericht`
  MODIFY `bericht_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `favoriet`
--
ALTER TABLE `favoriet`
  MODIFY `favoriet_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `job`
--
ALTER TABLE `job`
  MODIFY `job_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student`
--
ALTER TABLE `student`
  MODIFY `student_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `swipe`
--
ALTER TABLE `swipe`
  MODIFY `swipe_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bericht`
--
ALTER TABLE `bericht`
  ADD CONSTRAINT `bericht_ibfk_1` FOREIGN KEY (`favoriet_id`) REFERENCES `favoriet` (`favoriet_id`) ON DELETE CASCADE;

--
-- Constraints for table `favoriet`
--
ALTER TABLE `favoriet`
  ADD CONSTRAINT `favoriet_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favoriet_ibfk_2` FOREIGN KEY (`job_id`) REFERENCES `job` (`job_id`) ON DELETE CASCADE;

--
-- Constraints for table `job`
--
ALTER TABLE `job`
  ADD CONSTRAINT `job_ibfk_1` FOREIGN KEY (`bedrijf_id`) REFERENCES `bedrijf` (`bedrijf_id`);

--
-- Constraints for table `swipe`
--
ALTER TABLE `swipe`
  ADD CONSTRAINT `swipe_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `swipe_ibfk_2` FOREIGN KEY (`job_id`) REFERENCES `job` (`job_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
