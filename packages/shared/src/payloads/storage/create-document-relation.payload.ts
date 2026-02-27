import * as yup from "yup";
import { entityTypeValidator } from "../../models/entity-type";

export const createDocumentRelationPayloadValidator = yup.object({
  documentId: yup.string().required(),
  entityId: yup.string().required(),
  entityType: entityTypeValidator,
});

export type CreateDocumentRelationPayload = yup.InferType<
  typeof createDocumentRelationPayloadValidator
>;
