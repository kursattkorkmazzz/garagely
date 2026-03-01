import type { UserModel, UserWithPreferences } from '@garagely/shared/models/user';
import type { DocumentModel } from '@garagely/shared/models/document';
import { EntityType } from '@garagely/shared/models/entity-type';
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UpdateUserPreferencesPayload,
} from '@garagely/shared/payloads/user';
import { NotFoundError, ConflictError } from '@garagely/shared/error.types';
import type {
  IUserRepository,
  IUserPreferencesRepository,
} from '../repositories/user.repository.interface';
import type { StorageService, UploadedFile } from '../../storage/services/storage.service';

export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly preferencesRepository: IUserPreferencesRepository,
    private readonly storageService?: StorageService,
  ) {}

  async getUserById(id: string): Promise<UserModel> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const profilePhoto = this.storageService
      ? await this.getAvatar(id)
      : null;

    return { ...user, profilePhoto };
  }

  async getUserWithPreferences(id: string): Promise<UserWithPreferences> {
    const user = await this.userRepository.findByIdWithPreferences(id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const profilePhoto = this.storageService
      ? await this.getAvatar(id)
      : null;

    return { ...user, profilePhoto };
  }

  async createUser(id: string, data: CreateUserPayload): Promise<UserModel> {
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const user = await this.userRepository.create(id, data);
    await this.preferencesRepository.create(id);

    return { ...user, profilePhoto: null };
  }

  async updateUser(id: string, data: UpdateUserPayload): Promise<UserModel> {
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await this.userRepository.update(id, data);
    const profilePhoto = this.storageService
      ? await this.getAvatar(id)
      : null;

    return { ...updatedUser, profilePhoto };
  }

  async updateUserPreferences(
    userId: string,
    data: UpdateUserPreferencesPayload
  ): Promise<UserWithPreferences> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    await this.preferencesRepository.update(userId, data);

    return this.getUserWithPreferences(userId);
  }

  async deleteUser(id: string): Promise<void> {
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    if (this.storageService) {
      await this.storageService.deleteDocumentsByEntity(
        id,
        EntityType.USER_PROFILE,
        id,
      );
    }

    await this.userRepository.delete(id);
  }

  async uploadAvatar(userId: string, file: UploadedFile): Promise<DocumentModel> {
    if (!this.storageService) {
      throw new Error('Storage service not configured');
    }

    await this.storageService.deleteDocumentsByEntity(
      userId,
      EntityType.USER_PROFILE,
      userId,
    );

    return this.storageService.uploadAndLinkDocument(
      userId,
      file,
      { entityType: EntityType.USER_PROFILE },
      userId,
    );
  }

  async getAvatar(userId: string): Promise<DocumentModel | null> {
    if (!this.storageService) {
      throw new Error('Storage service not configured');
    }

    const documents = await this.storageService.getDocumentsByEntity(
      userId,
      EntityType.USER_PROFILE,
    );

    return documents[0] ?? null;
  }

  async removeAvatar(userId: string): Promise<void> {
    if (!this.storageService) {
      throw new Error('Storage service not configured');
    }

    await this.storageService.deleteDocumentsByEntity(
      userId,
      EntityType.USER_PROFILE,
      userId,
    );
  }
}
