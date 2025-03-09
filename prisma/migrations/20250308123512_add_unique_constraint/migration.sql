/*
  Warnings:

  - A unique constraint covering the columns `[session_id,course_id,user_id]` on the table `sessions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_id_course_id_user_id_key" ON "sessions"("session_id", "course_id", "user_id");
