-- Add isGraduated column to User table
ALTER TABLE "User" ADD COLUMN "isGraduated" BOOLEAN NOT NULL DEFAULT 0;
