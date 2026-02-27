import * as yup from "yup";
import { entityTypeValidator } from "../../models/entity-type";

export const uploadDocumentPayloadValidator = yup.object({
  title: yup.string().optional(),
  entityType: entityTypeValidator,
});

export type UploadDocumentPayload = yup.InferType<
  typeof uploadDocumentPayloadValidator
>;
