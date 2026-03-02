import { Router } from "express";
import multer from "multer";
import { StorageController } from "../controllers/storage.controller";
import { StorageService } from "../services/storage.service";
import { DocumentRepository } from "../repositories/document.repository";
import { DocumentRelationRepository } from "../repositories/document-relation.repository";
import { authMiddleware } from "../../../common/middleware/auth.middleware";
import { validatePayload } from "../../../common/middleware/validate.middleware";
import {
  createDocumentRelationPayloadValidator,
  uploadDocumentPayloadValidator,
} from "@garagely/shared/payloads/storage";
import { asyncHandler } from "../../../common/utils/async-handler.util";
import { multerRestricton } from "../utils/multer";
import { EntityType } from "@garagely/shared/models/entity-type";

const router = Router();

const documentRepository = new DocumentRepository();
const documentRelationRepository = new DocumentRelationRepository();
const storageService = new StorageService(
  documentRepository,
  documentRelationRepository,
);
const storageController = new StorageController(storageService);

router.use(authMiddleware);

router.post(
  "/upload",
  multerRestricton(EntityType.USER_PROFILE),
  validatePayload(uploadDocumentPayloadValidator),
  asyncHandler(storageController.upload),
);
router.get("/documents", asyncHandler(storageController.getMyDocuments));
router.get("/documents/:id", asyncHandler(storageController.getDocument));
router.delete("/documents/:id", asyncHandler(storageController.deleteDocument));

router.post(
  "/relations",
  validatePayload(createDocumentRelationPayloadValidator),
  asyncHandler(storageController.createRelation),
);
router.delete("/relations/:id", asyncHandler(storageController.deleteRelation));

export { router as storageRouter };
