ALTER TABLE User ADD COLUMN role TEXT DEFAULT 'USER';
ALTER TABLE User ADD COLUMN nickname TEXT;
CREATE TABLE "PhotoLike" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PhotoLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PhotoLike_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "PhotoLike_userId_idx" ON "PhotoLike"("userId");
CREATE INDEX "PhotoLike_photoId_idx" ON "PhotoLike"("photoId");
CREATE UNIQUE INDEX "PhotoLike_userId_photoId_key" ON "PhotoLike"("userId", "photoId");
