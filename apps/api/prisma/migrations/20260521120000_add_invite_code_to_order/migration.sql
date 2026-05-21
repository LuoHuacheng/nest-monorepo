-- AlterTable
ALTER TABLE "order" ADD COLUMN "invite_code_id" TEXT;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_invite_code_id_fkey" FOREIGN KEY ("invite_code_id") REFERENCES "event_invite_code"("id") ON DELETE SET NULL ON UPDATE CASCADE;
