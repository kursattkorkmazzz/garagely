import type { DocumentRelationModel } from "@garagely/shared/models/document-relation";
import type { EntityType } from "@garagely/shared/models/entity-type";

export interface CreateDocumentRelationData {
  documentId: string;
  entityId: string;
  entityType: EntityType;
}

export interface IDocumentRelationRepository {
  findById(id: string): Promise<DocumentRelationModel | null>;
  findByDocumentId(documentId: string): Promise<DocumentRelationModel[]>;
  findByEntity(
    entityId: string,
    entityType: EntityType,
  ): Promise<DocumentRelationModel[]>;
  create(data: CreateDocumentRelationData): Promise<DocumentRelationModel>;
  delete(id: string): Promise<void>;
  deleteByDocumentId(documentId: string): Promise<void>;
}
