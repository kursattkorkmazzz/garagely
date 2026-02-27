import type { UserPreferencesModel } from "@garagely/shared/models/user-preferences";
import type { DistanceUnit } from "@garagely/shared/models/distance-unit";
import type { Theme } from "@garagely/shared/models/theme";

export class UserPreferencesMapper {
  static toDomain(
    id: string,
    data: FirebaseFirestore.DocumentData,
  ): UserPreferencesModel {
    return {
      id,
      userId: data.userId,
      locale: data.locale,
      preferredDistanceUnit: data.preferredDistanceUnit as DistanceUnit,
      preferredCurrency: data.preferredCurrency,
      theme: data.theme as Theme,
      createdAt: data.createdAt?.toDate?.() ?? new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate?.() ?? new Date(data.updatedAt),
    };
  }
}
