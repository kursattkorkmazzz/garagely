import { Router } from "express";
import multer from "multer";
import { VehicleController } from "../controllers/vehicle.controller";
import { VehicleService } from "../services/vehicle.service";
import { VehicleRepository } from "../repositories/vehicle.repository";
import { VehicleBrandRepository } from "../repositories/vehicle-brand.repository";
import { VehicleModelRepository } from "../repositories/vehicle-model.repository";
import { VehicleLookupRepository } from "../repositories/vehicle-lookup.repository";
import { StorageService } from "../../storage/services/storage.service";
import { DocumentRepository } from "../../storage/repositories/document.repository";
import { DocumentRelationRepository } from "../../storage/repositories/document-relation.repository";
import { authMiddleware } from "../../../common/middleware/auth.middleware";
import { validatePayload } from "../../../common/middleware/validate.middleware";
import {
  createVehiclePayloadValidator,
  updateVehiclePayloadValidator,
  createVehicleModelPayloadValidator,
} from "@garagely/shared/payloads/vehicle";
import { asyncHandler } from "../../../common/utils/async-handler.util";
import { getStorageLimits } from "../../storage/config/storage.config";
import { EntityType } from "@garagely/shared/models/entity-type";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: getStorageLimits(EntityType.VEHICLE_COVER).fileSize,
  },
});

// Initialize repositories
const vehicleRepository = new VehicleRepository();
const vehicleBrandRepository = new VehicleBrandRepository();
const vehicleModelRepository = new VehicleModelRepository();
const vehicleLookupRepository = new VehicleLookupRepository();
const documentRepository = new DocumentRepository();
const documentRelationRepository = new DocumentRelationRepository();
const storageService = new StorageService(documentRepository, documentRelationRepository);
const vehicleService = new VehicleService(
  vehicleRepository,
  vehicleBrandRepository,
  vehicleModelRepository,
  vehicleLookupRepository,
  storageService,
);
const vehicleController = new VehicleController(vehicleService);

// All routes require authentication
router.use(authMiddleware);

// Lookup endpoints
router.get("/brands", asyncHandler(vehicleController.getBrands));
router.get("/brands/:brandId/models", asyncHandler(vehicleController.getModelsByBrand));
router.get("/transmission-types", asyncHandler(vehicleController.getTransmissionTypes));
router.get("/body-types", asyncHandler(vehicleController.getBodyTypes));
router.get("/fuel-types", asyncHandler(vehicleController.getFuelTypes));

// User model creation
router.post(
  "/models",
  validatePayload(createVehicleModelPayloadValidator),
  asyncHandler(vehicleController.createModel),
);

// Vehicle CRUD
router.get("/", asyncHandler(vehicleController.getVehicles));

router.post(
  "/",
  validatePayload(createVehiclePayloadValidator),
  asyncHandler(vehicleController.createVehicle),
);

router.get("/:id", asyncHandler(vehicleController.getVehicleById));

router.patch(
  "/:id",
  validatePayload(updateVehiclePayloadValidator),
  asyncHandler(vehicleController.updateVehicle),
);

router.delete("/:id", asyncHandler(vehicleController.deleteVehicle));

// Cover photo endpoints
router.post("/:id/cover", upload.single("file"), asyncHandler(vehicleController.uploadCover));
router.get("/:id/cover", asyncHandler(vehicleController.getCover));
router.delete("/:id/cover", asyncHandler(vehicleController.removeCover));

export { router as vehicleRouter };
