import * as yup from "yup";
import { EntityType, entityTypeValidator } from "../entity-type";

export const documentRelationModelValidator = yup.object({
  id: yup.string().required(),
  documentId: yup.string().required(),
  entityId: yup.string().required(),
  entityType: entityTypeValidator,
});

export type DocumentRelationModel = yup.InferType<
  typeof documentRelationModelValidator
>;

export { EntityType };
