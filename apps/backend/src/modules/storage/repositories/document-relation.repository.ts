import {
  documentRelationModelValidator,
  type DocumentRelationModel,
} from "@garagely/shared/models/document-relation";
import type { EntityType } from "@garagely/shared/models/entity-type";
import { db } from "../../../providers/firebase";
import type {
  CreateDocumentRelationData,
  IDocumentRelationRepository,
} from "./document-relation.repository.interface";

const DOCUMENT_RELATIONS_COLLECTION = "document_relations";

export class DocumentRelationRepository implements IDocumentRelationRepository {
  async findById(id: string): Promise<DocumentRelationModel | null> {
    const doc = await db
      .collection(DOCUMENT_RELATIONS_COLLECTION)
      .doc(id)
      .get();

    if (!doc.exists) {
      return null;
    }

    return documentRelationModelValidator.cast({ id, ...doc.data() });
  }

  async findByDocumentId(documentId: string): Promise<DocumentRelationModel[]> {
    const snapshot = await db
      .collection(DOCUMENT_RELATIONS_COLLECTION)
      .where("documentId", "==", documentId)
      .get();

    return snapshot.docs.map((doc) =>
      documentRelationModelValidator.cast({ id: doc.id, ...doc.data() }),
    );
  }

  async findByEntity(
    entityId: string,
    entityType: EntityType,
  ): Promise<DocumentRelationModel[]> {
    const snapshot = await db
      .collection(DOCUMENT_RELATIONS_COLLECTION)
      .where("entityId", "==", entityId)
      .where("entityType", "==", entityType)
      .get();

    return snapshot.docs.map((doc) =>
      documentRelationModelValidator.cast({ id: doc.id, ...doc.data() }),
    );
  }

  async create(
    data: CreateDocumentRelationData,
  ): Promise<DocumentRelationModel> {
    const docData = {
      documentId: data.documentId,
      entityId: data.entityId,
      entityType: data.entityType,
    };

    const docRef = await db
      .collection(DOCUMENT_RELATIONS_COLLECTION)
      .add(docData);

    return documentRelationModelValidator.cast({ id: docRef.id, ...docData });
  }

  async delete(id: string): Promise<void> {
    await db.collection(DOCUMENT_RELATIONS_COLLECTION).doc(id).delete();
  }

  async deleteByDocumentId(documentId: string): Promise<void> {
    const snapshot = await db
      .collection(DOCUMENT_RELATIONS_COLLECTION)
      .where("documentId", "==", documentId)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
}
