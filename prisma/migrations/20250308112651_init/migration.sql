-- CreateTable
CREATE TABLE "courses" (
    "course_id" UUID NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("course_id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "session_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "total_modules" INTEGER NOT NULL,
    "average_score" DOUBLE PRECISION NOT NULL,
    "time_studied" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" UUID NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
