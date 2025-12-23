-- CreateTable
CREATE TABLE "AppConfig" (
    "iosMinVersion" TEXT NOT NULL,
    "androidMinVersion" TEXT NOT NULL,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("iosMinVersion","androidMinVersion")
);
