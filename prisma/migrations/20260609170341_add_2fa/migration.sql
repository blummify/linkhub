-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "activeCustomThemeId" TEXT,
ADD COLUMN     "backgroundKey" TEXT,
ADD COLUMN     "backgroundType" TEXT NOT NULL DEFAULT 'gradient',
ADD COLUMN     "backgroundValue" TEXT NOT NULL DEFAULT 'midnight',
ADD COLUMN     "bodyFont" TEXT NOT NULL DEFAULT 'Geist',
ADD COLUMN     "cardStyle" TEXT NOT NULL DEFAULT 'filled',
ADD COLUMN     "customThemeName" VARCHAR(60) NOT NULL DEFAULT 'My Theme',
ADD COLUMN     "effects" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "linkDensity" TEXT NOT NULL DEFAULT 'default',
ADD COLUMN     "overlayColor" TEXT NOT NULL DEFAULT '#000000',
ADD COLUMN     "overlayOpacity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "textColor" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorSecret" TEXT;

-- CreateTable
CREATE TABLE "TwoFactorBackupCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TwoFactorBackupCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paystackCustomerId" TEXT,
    "paystackSubscriptionId" TEXT,
    "paystackPlanCode" TEXT,
    "authorizationCode" TEXT,
    "cardLast4" TEXT,
    "cardBrand" TEXT,
    "cardExpiry" TEXT,
    "planId" TEXT NOT NULL DEFAULT 'free',
    "status" TEXT NOT NULL DEFAULT 'active',
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomTheme" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(60) NOT NULL DEFAULT 'My Theme',
    "themeId" TEXT NOT NULL DEFAULT 'default',
    "accentColor" TEXT NOT NULL DEFAULT '#3b46e0',
    "buttonStyle" TEXT NOT NULL DEFAULT 'rounded',
    "fontFamily" TEXT NOT NULL DEFAULT 'Instrument Serif',
    "backgroundType" TEXT NOT NULL DEFAULT 'gradient',
    "backgroundValue" TEXT NOT NULL DEFAULT 'midnight',
    "backgroundKey" TEXT,
    "effects" TEXT NOT NULL DEFAULT '',
    "textColor" TEXT,
    "cardStyle" TEXT NOT NULL DEFAULT 'filled',
    "bodyFont" TEXT NOT NULL DEFAULT 'Geist',
    "overlayColor" TEXT NOT NULL DEFAULT '#000000',
    "overlayOpacity" INTEGER NOT NULL DEFAULT 0,
    "profileLayout" TEXT NOT NULL DEFAULT 'classic',
    "linkDensity" TEXT NOT NULL DEFAULT 'default',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomTheme_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TwoFactorBackupCode_userId_idx" ON "TwoFactorBackupCode"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_paystackCustomerId_key" ON "Subscription"("paystackCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_paystackSubscriptionId_key" ON "Subscription"("paystackSubscriptionId");

-- AddForeignKey
ALTER TABLE "TwoFactorBackupCode" ADD CONSTRAINT "TwoFactorBackupCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomTheme" ADD CONSTRAINT "CustomTheme_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
