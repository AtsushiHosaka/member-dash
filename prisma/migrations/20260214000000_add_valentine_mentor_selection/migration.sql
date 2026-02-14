-- CreateTable
CREATE TABLE "ValentineMentorSelection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventCode" TEXT NOT NULL,
    "mentorKey" TEXT NOT NULL,
    "giftType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ValentineMentorSelection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ValentineMentorSelection_userId_eventCode_key" ON "ValentineMentorSelection"("userId", "eventCode");

-- CreateIndex
CREATE INDEX "ValentineMentorSelection_eventCode_mentorKey_idx" ON "ValentineMentorSelection"("eventCode", "mentorKey");

-- AddForeignKey
ALTER TABLE "ValentineMentorSelection" ADD CONSTRAINT "ValentineMentorSelection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
