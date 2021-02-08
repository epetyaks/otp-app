USE radiususers;
CREATE TABLE `users` (
  `username` varchar(255) NOT NULL,
  `md5pass` varchar(255) NOT NULL,
  `enabled` tinyint(1) NOT NULL,
  `qrlink` varchar(255) DEFAULT NULL,
 `email` varchar(255) DEFAULT NULL,
  `qrviewed` tinyint(1) NOT NULL,
  PRIMARY KEY (`username`),
  UNIQUE KEY `username` (`username`),
  CONSTRAINT `CONSTRAINT_1` CHECK (`enabled` in (0,1))
);
INSERT INTO users (username,md5pass,enabled,qrviewed) 
VALUES ('admin','pbkdf2:sha256:150000$DnowB46a$f5ff80d9fa760b1a3b68fbfe10b209a99e22020138247112d4e567aba25bc9e7',True,True
);
CREATE USER 'useradmin' IDENTIFIED BY 'testing123';
GRANT ALL PRIVILEGES ON radiususers.users to 'useradmin'@'%';
