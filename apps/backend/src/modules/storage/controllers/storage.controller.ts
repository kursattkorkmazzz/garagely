import type { Request, Response } from "express";
import type { StorageService, UploadedFile } from "../services/storage.service";
import { sendSuccess } from "../../../common/utils/response.util";
import { ValidationError } from "@garagely/shared/error.types";

export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  upload = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;
    const file = req.file as UploadedFile | undefined;

    if (!file) {
      throw new ValidationError("No file uploaded", { file: ["File is required"] });
    }

    const document = await this.storageService.uploadDocument(
      userId,
      file,
      req.body,
    );

    sendSuccess(res, document, 201);
  };

  getMyDocuments = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;
    const documents = await this.storageService.getDocumentsByUserId(userId);
    sendSuccess(res, documents);
  };

  getDocument = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const document = await this.storageService.getDocumentById(id);
    sendSuccess(res, document);
  };

  deleteDocument = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;
    const id = req.params.id as string;
    await this.storageService.deleteDocument(id, userId);
    sendSuccess(res, { message: "Document deleted successfully" });
  };

  createRelation = async (req: Request, res: Response): Promise<void> => {
    const { documentId, entityId, entityType } = req.body;
    const relation = await this.storageService.createRelation(
      documentId,
      entityId,
      entityType,
    );
    sendSuccess(res, relation, 201);
  };

  deleteRelation = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    await this.storageService.deleteRelation(id);
    sendSuccess(res, { message: "Relation deleted successfully" });
  };
}
