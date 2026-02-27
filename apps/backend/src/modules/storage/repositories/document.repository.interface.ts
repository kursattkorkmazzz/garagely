import type { DocumentModel } from "@garagely/shared/models/document";

export interface CreateDocumentData {
  userId: string;
  title: string;
  storagePath: string;
  url: string;
  documentSize: number;
  mimeType: string;
}

export interface IDocumentRepository {
  findById(id: string): Promise<DocumentModel | null>;
  findByUserId(userId: string): Promise<DocumentModel[]>;
  create(data: CreateDocumentData): Promise<DocumentModel>;
  delete(id: string): Promise<void>;
}
