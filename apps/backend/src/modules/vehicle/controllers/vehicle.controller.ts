import type { Request, Response } from "express";
import type { VehicleService } from "../services/vehicle.service";
import type { UploadedFile } from "../../storage/services/storage.service";
import { sendSuccess, sendPaginated } from "../../../common/utils/response.util";
import { ValidationError } from "@garagely/shared/error.types";
import { VehicleImageType } from "@garagely/shared/models/vehicle";
import { extractSearchPaginationQuery } from "../../../common/utils/pagination.util";

export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  // Lookup endpoints
  getBrands = async (req: Request, res: Response): Promise<void> => {
    const query = extractSearchPaginationQuery(req);
    const result = await this.vehicleService.getBrands(query);
    sendPaginated(res, result.data, result.meta);
  };

  getModelsByBrand = async (req: Request, res: Response): Promise<void> => {
    const brandId = req.params.brandId as string;
    const query = extractSearchPaginationQuery(req);
    const result = await this.vehicleService.getModelsByBrand(brandId, query);
    sendPaginated(res, result.data, result.meta);
  };

  getTransmissionTypes = async (
    _req: Request,
    res: Response,
  ): Promise<void> => {
    const types = await this.vehicleService.getTransmissionTypes();
    sendSuccess(res, types);
  };

  getBodyTypes = async (_req: Request, res: Response): Promise<void> => {
    const types = await this.vehicleService.getBodyTypes();
    sendSuccess(res, types);
  };

  getFuelTypes = async (_req: Request, res: Response): Promise<void> => {
    const types = await this.vehicleService.getFuelTypes();
    sendSuccess(res, types);
  };

  // Upsert brand and model together
  upsertBrandAndModel = async (req: Request, res: Response): Promise<void> => {
    const result = await this.vehicleService.upsertBrandAndModel(req.body);
    sendSuccess(res, result, 200);
  };

  // Vehicle CRUD
  createVehicle = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;
    const vehicle = await this.vehicleService.createVehicle(userId, req.body);
    sendSuccess(res, vehicle, 201);
  };

  getVehicles = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;
    const vehicles = await this.vehicleService.getVehiclesByUser(userId);
    sendSuccess(res, vehicles);
  };

  getDetailedVehicles = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;
    const vehicles = await this.vehicleService.getDetailedVehiclesByUser(userId);
    sendSuccess(res, vehicles);
  };

  getVehicleById = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;
    const id = req.params.id as string;
    const vehicle = await this.vehicleService.getVehicleById(userId, id);
    sendSuccess(res, vehicle);
  };

  updateVehicle = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;
    const id = req.params.id as string;
    const vehicle = await this.vehicleService.updateVehicle(
      userId,
      id,
      req.body,
    );
    sendSuccess(res, vehicle);
  };

  deleteVehicle = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;
    const id = req.params.id as string;
    await this.vehicleService.deleteVehicle(userId, id);
    sendSuccess(res, { message: "Vehicle deleted successfully" });
  };

  // Vehicle image endpoints
  uploadImage = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;
    const id = req.params.id as string;
    const imageType = req.params.imageType as string;
    const file = req.file as UploadedFile | undefined;

    if (!file) {
      throw new ValidationError("No file uploaded", {
        file: ["File is required"],
      });
    }

    if (!Object.values(VehicleImageType).includes(imageType as VehicleImageType)) {
      throw new ValidationError("Invalid image type", {
        imageType: [`Must be one of: ${Object.values(VehicleImageType).join(", ")}`],
      });
    }

    const document = await this.vehicleService.uploadImage(
      userId,
      id,
      imageType as VehicleImageType,
      file,
    );
    sendSuccess(res, document, 201);
  };

  getImage = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const imageType = req.params.imageType as string;

    if (!Object.values(VehicleImageType).includes(imageType as VehicleImageType)) {
      throw new ValidationError("Invalid image type", {
        imageType: [`Must be one of: ${Object.values(VehicleImageType).join(", ")}`],
      });
    }

    const image = await this.vehicleService.getImage(
      id,
      imageType as VehicleImageType,
    );
    sendSuccess(res, image);
  };

  removeImage = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;
    const id = req.params.id as string;
    const imageType = req.params.imageType as string;

    if (!Object.values(VehicleImageType).includes(imageType as VehicleImageType)) {
      throw new ValidationError("Invalid image type", {
        imageType: [`Must be one of: ${Object.values(VehicleImageType).join(", ")}`],
      });
    }

    await this.vehicleService.removeImage(
      userId,
      id,
      imageType as VehicleImageType,
    );
    sendSuccess(res, { message: "Image removed successfully" });
  };

  getAllImages = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const images = await this.vehicleService.getAllImages(id);
    sendSuccess(res, images);
  };
}
