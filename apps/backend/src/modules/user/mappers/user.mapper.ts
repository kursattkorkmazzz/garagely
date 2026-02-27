import type { UserModel } from "@garagely/shared/models/user";

export class UserMapper {
  static toDomain(
    id: string,
    data: FirebaseFirestore.DocumentData,
  ): UserModel {
    return {
      id,
      fullName: data.fullName,
      email: data.email,
      createdAt: data.createdAt?.toDate?.() ?? new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate?.() ?? new Date(data.updatedAt),
    };
  }
}
