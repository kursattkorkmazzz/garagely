import type { DocumentModel } from "@garagely/shared/models/document";
import type { DocumentRelationModel } from "@garagely/shared/models/document-relation";
import type { EntityType } from "@garagely/shared/models/entity-type";
import type { UploadDocumentPayload } from "@garagely/shared/payloads/storage";
import { NotFoundError, ValidationError } from "@garagely/shared/error.types";
import { storage } from "../../../providers/firebase";
import type { IDocumentRepository } from "../repositories/document.repository.interface";
import type { IDocumentRelationRepository } from "../repositories/document-relation.repository.interface";
import { getStorageLimits } from "../config/storage.config";

const useEmulator = process.env.FIREBASE_USE_EMULATOR === "true";
const storageEmulatorHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST ?? "127.0.0.1:9199";

export interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export class StorageService {
  constructor(
    private readonly documentRepository: IDocumentRepository,
    private readonly documentRelationRepository: IDocumentRelationRepository,
  ) {}

  async uploadDocument(
    userId: string,
    file: UploadedFile,
    payload: UploadDocumentPayload,
  ): Promise<DocumentModel> {
    const limits = getStorageLimits(payload.entityType);

    if (file.size > limits.maxFileSize) {
      const maxSizeMB = Math.round(limits.maxFileSize / (1024 * 1024));
      throw new ValidationError(
        `File size exceeds the maximum allowed size of ${maxSizeMB}MB for ${payload.entityType}`,
        { file: [`Maximum file size is ${maxSizeMB}MB`] },
      );
    }

    const bucket = storage.bucket();
    const timestamp = Date.now();
    const storagePath = `documents/${userId}/${payload.entityType}/${timestamp}_${file.originalname}`;

    const fileRef = bucket.file(storagePath);
    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    });

    let url: string;
    if (useEmulator) {
      const encodedPath = encodeURIComponent(storagePath);
      url = `http://${storageEmulatorHost}/v0/b/${bucket.name}/o/${encodedPath}?alt=media`;
    } else {
      await fileRef.makePublic();
      url = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
    }

    const document = await this.documentRepository.create({
      userId,
      title: payload.title ?? file.originalname,
      storagePath,
      url,
      documentSize: file.size,
      mimeType: file.mimetype,
    });

    return document;
  }

  async getDocumentById(id: string): Promise<DocumentModel> {
    const document = await this.documentRepository.findById(id);

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    return document;
  }

  async getDocumentsByUserId(userId: string): Promise<DocumentModel[]> {
    return this.documentRepository.findByUserId(userId);
  }

  async deleteDocument(id: string, userId: string): Promise<void> {
    const document = await this.documentRepository.findById(id);

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    if (document.userId !== userId) {
      throw new NotFoundError("Document not found");
    }

    const bucket = storage.bucket();
    const fileRef = bucket.file(document.storagePath);

    try {
      await fileRef.delete();
    } catch {
      // File might not exist in storage, continue with DB cleanup
    }

    await this.documentRelationRepository.deleteByDocumentId(id);
    await this.documentRepository.delete(id);
  }

  async createRelation(
    documentId: string,
    entityId: string,
    entityType: EntityType,
  ): Promise<DocumentRelationModel> {
    const document = await this.documentRepository.findById(documentId);

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    return this.documentRelationRepository.create({
      documentId,
      entityId,
      entityType,
    });
  }

  async getRelationsByEntity(
    entityId: string,
    entityType: EntityType,
  ): Promise<DocumentRelationModel[]> {
    return this.documentRelationRepository.findByEntity(entityId, entityType);
  }

  async getDocumentsByEntity(
    entityId: string,
    entityType: EntityType,
  ): Promise<DocumentModel[]> {
    const relations = await this.documentRelationRepository.findByEntity(
      entityId,
      entityType,
    );

    const documents = await Promise.all(
      relations.map((relation) =>
        this.documentRepository.findById(relation.documentId),
      ),
    );

    return documents.filter((doc): doc is DocumentModel => doc !== null);
  }

  async deleteRelation(id: string): Promise<void> {
    const relation = await this.documentRelationRepository.findById(id);

    if (!relation) {
      throw new NotFoundError("Document relation not found");
    }

    await this.documentRelationRepository.delete(id);
  }

  async deleteDocumentsByEntity(
    entityId: string,
    entityType: EntityType,
    userId: string,
  ): Promise<void> {
    const relations = await this.documentRelationRepository.findByEntity(
      entityId,
      entityType,
    );

    for (const relation of relations) {
      await this.deleteDocument(relation.documentId, userId);
    }
  }

  async uploadAndLinkDocument(
    userId: string,
    file: UploadedFile,
    payload: UploadDocumentPayload,
    entityId: string,
  ): Promise<DocumentModel> {
    const document = await this.uploadDocument(userId, file, payload);

    await this.documentRelationRepository.create({
      documentId: document.id,
      entityId,
      entityType: payload.entityType,
    });

    return document;
  }
}
