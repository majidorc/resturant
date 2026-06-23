DELETE FROM "CustomerLead" a
USING "CustomerLead" b
WHERE a."restaurantId" = b."restaurantId"
  AND a.email = b.email
  AND a."createdAt" < b."createdAt";

CREATE UNIQUE INDEX "CustomerLead_restaurantId_email_key" ON "CustomerLead"("restaurantId", "email");
