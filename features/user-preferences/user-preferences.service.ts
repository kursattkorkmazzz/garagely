import { GetGaragelyDatabase } from "@/db/db";
import { UserPreferences } from "./entity/user-preferences.entity";

export class UserPreferencesService {
  private static async repo() {
    const db = await GetGaragelyDatabase();
    return db.getRepository(UserPreferences);
  }

  static async getOrCreate(): Promise<UserPreferences> {
    const repo = await this.repo();
    const existing = await repo.findOne({ where: {} });
    if (existing) return existing;
    return repo.save(repo.create());
  }

  static async update(
    partial: Partial<Omit<UserPreferences, "id" | "createdAt" | "updateAt">>
  ): Promise<void> {
    const repo = await this.repo();
    const prefs = await this.getOrCreate();
    await repo.save({ ...prefs, ...partial });
  }
}
