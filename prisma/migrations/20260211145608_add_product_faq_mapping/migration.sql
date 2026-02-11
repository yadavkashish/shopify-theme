-- CreateTable
CREATE TABLE "ProductFAQMapping" (
    "id" TEXT NOT NULL,
    "faqTitle" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "ProductFAQMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductFAQMapping_faqTitle_productId_key" ON "ProductFAQMapping"("faqTitle", "productId");
