-- Keep only the newest verification token per user before adding the unique constraint.
DELETE FROM "EmailVerificationToken" older
USING "EmailVerificationToken" newer
WHERE older.user_id = newer.user_id
  AND older.created_at < newer.created_at;

DROP INDEX IF EXISTS "EmailVerificationToken_user_id_idx";

CREATE UNIQUE INDEX "EmailVerificationToken_user_id_key" ON "EmailVerificationToken"("user_id");
