-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nickname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "user_avatar" TEXT,
    "description" TEXT,
    "birthday" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValorantData" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ValorantData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Csgo_data" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Csgo_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ValorantData_userId_key" ON "ValorantData"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Csgo_data_userId_key" ON "Csgo_data"("userId");

-- AddForeignKey
ALTER TABLE "ValorantData" ADD CONSTRAINT "ValorantData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Csgo_data" ADD CONSTRAINT "Csgo_data_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
