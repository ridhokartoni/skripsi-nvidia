-- AlterTable
CREATE SEQUENCE container_id_seq;
ALTER TABLE "Container" ALTER COLUMN "id" SET DEFAULT nextval('container_id_seq');
ALTER SEQUENCE container_id_seq OWNED BY "Container"."id";
