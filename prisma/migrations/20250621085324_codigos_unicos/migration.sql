/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Question` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `QuestionAnswer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `QuestionType` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Question_code_key" ON "Question"("code");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionAnswer_code_key" ON "QuestionAnswer"("code");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionType_code_key" ON "QuestionType"("code");
