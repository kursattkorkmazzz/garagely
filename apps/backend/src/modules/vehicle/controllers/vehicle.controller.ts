import type { Request, Response } from "express";
import type { VehicleService } from "../services/vehicle.service";
import type { UploadedFile } from "../../storage/services/storage.service";
import { sendSuccess } from "../../../common/utils/response.util";
import { ValidationError } from "@garagely/shared/error.types";

export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  // Lookup endpoints
  getBrands = async (_req: Request, res: Response): Promise<void> => {
    const brands = await this.vehicleService.getBrands();
    sendSuccess(res, brands);
  };

  getModelsByBrand = async (req: Request, res: Response): Promise<void> => {
    const brandId = req.params.brandId as string;
    const models = await this.vehicleService.getModelsByBrand(brandId);
    sendSuccess(res, models);
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

  // Cover photo endpoints
  uploadCover = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;
    const id = req.params.id as string;
    const file = req.file as UploadedFile | undefined;

    if (!file) {
      throw new ValidationError("No file uploaded", {
        file: ["File is required"],
      });
    }

    const document = await this.vehicleService.uploadCover(userId, id, file);
    sendSuccess(res, document, 201);
  };

  getCover = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const cover = await this.vehicleService.getCover(id);
    sendSuccess(res, cover);
  };

  removeCover = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;
    const id = req.params.id as string;
    await this.vehicleService.removeCover(userId, id);
    sendSuccess(res, { message: "Cover photo removed successfully" });
  };
}
