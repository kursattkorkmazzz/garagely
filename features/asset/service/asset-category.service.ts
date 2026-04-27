import { GetGaragelyDatabase } from "@/db/db";
import { AssetCategoryEntity } from "@/features/asset/entity/asset-category.entity";
import { AssetEntity } from "@/features/asset/entity/asset.entity";
import { AssetCategoryErrors } from "@/features/asset/errors/asset-category.errors";
import { AppError } from "@/shared/errors/app-error";

export type CreateAssetCategoryDto = {
  name: string;
  icon?: string;
  sortOrder?: number;
};

export type UpdateAssetCategoryDto = Partial<CreateAssetCategoryDto>;

export class AssetCategoryService {
  private static async repo() {
    const db = await GetGaragelyDatabase();
    return db.getRepository(AssetCategoryEntity);
  }

  static async getAll(): Promise<AssetCategoryEntity[]> {
    return (await this.repo()).find({
      order: { sortOrder: "ASC", createdAt: "ASC" },
    });
  }

  static async create(
    dto: CreateAssetCategoryDto,
  ): Promise<AssetCategoryEntity> {
    const repo = await this.repo();
    return repo.save(
      repo.create({ ...dto, sortOrder: dto.sortOrder ?? 0 }),
    );
  }

  static async update(
    id: string,
    dto: UpdateAssetCategoryDto,
  ): Promise<AssetCategoryEntity> {
    const repo = await this.repo();
    await repo.update(id, dto);
    return repo.findOneByOrFail({ id });
  }

  static async delete(id: string): Promise<void> {
    await (await this.repo()).delete(id);
  }

  static async addAsset(categoryId: string, assetId: string): Promise<void> {
    const db = await GetGaragelyDatabase();
    const catRepo = db.getRepository(AssetCategoryEntity);

    const exists = await catRepo.existsBy({ id: categoryId });
    if (!exists) {
      throw AppError.createAppError(AssetCategoryErrors.CATEGORY_NOT_FOUND);
    }

    // QueryBuilder relation API — junction tablosuna doğrudan INSERT OR IGNORE
    await db
      .createQueryBuilder()
      .relation(AssetEntity, "categories")
      .of(assetId)
      .add(categoryId);
  }

  static async removeAsset(categoryId: string, assetId: string): Promise<void> {
    const db = await GetGaragelyDatabase();
    const catRepo = db.getRepository(AssetCategoryEntity);

    const exists = await catRepo.existsBy({ id: categoryId });
    if (!exists) {
      throw AppError.createAppError(AssetCategoryErrors.CATEGORY_NOT_FOUND);
    }

    await db
      .createQueryBuilder()
      .relation(AssetEntity, "categories")
      .of(assetId)
      .remove(categoryId);
  }
}
