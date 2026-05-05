import { GetGaragelyDatabase } from "@/db/db";
import { Tag } from "@/features/tag/entity/tag.entity";
import { TagErrors } from "@/features/tag/errors/tag.errors";
import { AppError } from "@/shared/errors/app-error";
import { Not } from "typeorm";

const NAME_MAX_LENGTH = 40;

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

function validateName(name: string): string {
  const normalized = normalizeName(name);
  if (!normalized) {
    throw AppError.createAppError(TagErrors.TAG_NAME_INVALID);
  }
  if (normalized.length > NAME_MAX_LENGTH) {
    throw AppError.createAppError(TagErrors.TAG_NAME_TOO_LONG);
  }
  return normalized;
}

export type ScopeUsage = { scope: string; count: number };

export class TagService {
  private static async repo() {
    const db = await GetGaragelyDatabase();
    return db.getRepository(Tag);
  }

  static async getByScope(scope: string): Promise<Tag[]> {
    const repo = await TagService.repo();
    return repo.find({
      where: { scope },
      order: { name: "ASC" },
    });
  }

  static async getById(id: string): Promise<Tag | null> {
    const repo = await TagService.repo();
    return repo.findOneBy({ id });
  }

  static async getByIds(ids: string[]): Promise<Tag[]> {
    if (ids.length === 0) return [];
    const repo = await TagService.repo();
    const { In } = await import("typeorm");
    return repo.find({ where: { id: In(ids) } });
  }

  /**
   * Aynı (name, scope) zaten varsa onu döner; yoksa oluşturup döner.
   * Name normalize edilir (trim + collapse spaces). Karşılaştırma case-insensitive.
   */
  static async getOrCreate(name: string, scope: string): Promise<Tag> {
    const normalized = validateName(name);
    const repo = await TagService.repo();

    const existing = await repo
      .createQueryBuilder("t")
      .where("LOWER(t.name) = LOWER(:name)", { name: normalized })
      .andWhere("t.scope = :scope", { scope })
      .getOne();

    if (existing) return existing;

    const tag = repo.create({ name: normalized, scope });
    return repo.save(tag);
  }

  static async rename(id: string, newName: string): Promise<Tag> {
    const normalized = validateName(newName);
    const repo = await TagService.repo();

    const tag = await repo.findOneBy({ id });
    if (!tag) {
      throw AppError.createAppError(TagErrors.TAG_NOT_FOUND);
    }

    const conflict = await repo
      .createQueryBuilder("t")
      .where("LOWER(t.name) = LOWER(:name)", { name: normalized })
      .andWhere("t.scope = :scope", { scope: tag.scope })
      .andWhere({ id: Not(id) })
      .getOne();

    if (conflict) {
      throw AppError.createAppError(TagErrors.TAG_NAME_ALREADY_EXISTS);
    }

    await repo.update(id, { name: normalized });
    return repo.findOneByOrFail({ id });
  }

  static async delete(id: string): Promise<void> {
    const repo = await TagService.repo();
    await repo.delete(id);
  }

  /**
   * Tüm scope'ları kullanım sayısıyla beraber döner. Yönetim ekranı için.
   */
  static async listScopes(): Promise<ScopeUsage[]> {
    const repo = await TagService.repo();
    const rows = await repo
      .createQueryBuilder("t")
      .select("t.scope", "scope")
      .addSelect("COUNT(*)", "count")
      .groupBy("t.scope")
      .orderBy("t.scope", "ASC")
      .getRawMany<{ scope: string; count: string | number }>();

    return rows.map((r) => ({
      scope: r.scope,
      count: typeof r.count === "string" ? parseInt(r.count, 10) : r.count,
    }));
  }
}
