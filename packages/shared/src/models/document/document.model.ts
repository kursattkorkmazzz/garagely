import * as yup from "yup";
import { firestoreDate } from "../../validators/firestore-date";

export const documentModelValidator = yup.object({
  id: yup.string().required(),
  userId: yup.string().required(),
  title: yup.string().required(),
  storagePath: yup.string().required(),
  url: yup.string().url().required(),
  documentSize: yup.number().positive().required(),
  mimeType: yup.string().required(),
  uploadedAt: firestoreDate().required(),
});

export type DocumentModel = yup.InferType<typeof documentModelValidator>;
