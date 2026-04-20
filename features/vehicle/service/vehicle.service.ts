import { GetGaragelyDatabase } from "@/db/db";
import { Vehicle } from "@/features/vehicle/entity/vehicle.entity";

export type CreateVehicleDto = Omit<Vehicle, "id" | "createdAt" | "updateAt">;
export type UpdateVehicleDto = Partial<CreateVehicleDto>;

export class VehicleService {
  private static async repo() {
    const db = await GetGaragelyDatabase();
    return db.getRepository(Vehicle);
  }

  static async getAll(): Promise<Vehicle[]> {
    const repo = await VehicleService.repo();
    return repo.find({ order: { createdAt: "DESC" } });
  }

  static async getById(id: string): Promise<Vehicle | null> {
    const repo = await VehicleService.repo();
    return repo.findOneBy({ id });
  }

  static async create(dto: CreateVehicleDto): Promise<Vehicle> {
    const repo = await VehicleService.repo();
    const vehicle = repo.create(dto);
    return repo.save(vehicle);
  }

  static async update(id: string, dto: UpdateVehicleDto): Promise<Vehicle> {
    const repo = await VehicleService.repo();
    await repo.update(id, dto);
    return (await repo.findOneByOrFail({ id }));
  }

  static async delete(id: string): Promise<void> {
    const repo = await VehicleService.repo();
    await repo.delete(id);
  }
}
