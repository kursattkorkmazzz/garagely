import {
  documentModelValidator,
  type DocumentModel,
} from "@garagely/shared/models/document";
import { db } from "../../../providers/firebase";
import type {
  CreateDocumentData,
  IDocumentRepository,
} from "./document.repository.interface";

const DOCUMENTS_COLLECTION = "documents";

export class DocumentRepository implements IDocumentRepository {
  async findById(id: string): Promise<DocumentModel | null> {
    const doc = await db.collection(DOCUMENTS_COLLECTION).doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return documentModelValidator.cast({ id, ...doc.data() });
  }

  async findByUserId(userId: string): Promise<DocumentModel[]> {
    const snapshot = await db
      .collection(DOCUMENTS_COLLECTION)
      .where("userId", "==", userId)
      .get();

    return snapshot.docs.map((doc) =>
      documentModelValidator.cast({ id: doc.id, ...doc.data() }),
    );
  }

  async create(data: CreateDocumentData): Promise<DocumentModel> {
    const now = new Date();
    const docData = {
      userId: data.userId,
      title: data.title,
      storagePath: data.storagePath,
      url: data.url,
      documentSize: data.documentSize,
      mimeType: data.mimeType,
      uploadedAt: now,
    };

    const docRef = await db.collection(DOCUMENTS_COLLECTION).add(docData);

    return documentModelValidator.cast({ id: docRef.id, ...docData });
  }

  async delete(id: string): Promise<void> {
    await db.collection(DOCUMENTS_COLLECTION).doc(id).delete();
  }
}
