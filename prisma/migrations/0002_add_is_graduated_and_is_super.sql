-- Alter User table
ALTER TABLE "User" ADD COLUMN "isGraduated" BOOLEAN NOT NULL DEFAULT false;

-- Alter Like table
ALTER TABLE "Like" ADD COLUMN "isSuper" BOOLEAN NOT NULL DEFAULT false;
