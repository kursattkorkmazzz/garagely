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
import { getMaxUploadSize } from "../config/storage.config";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: getMaxUploadSize(),
  },
});

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
  upload.single("file"),
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
