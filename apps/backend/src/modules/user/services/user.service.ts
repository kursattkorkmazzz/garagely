import type { UserModel, UserWithPreferences } from '@garagely/shared/models/user';
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

export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly preferencesRepository: IUserPreferencesRepository
  ) {}

  async getUserById(id: string): Promise<UserModel> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async getUserWithPreferences(id: string): Promise<UserWithPreferences> {
    const user = await this.userRepository.findByIdWithPreferences(id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async createUser(id: string, data: CreateUserPayload): Promise<UserModel> {
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const user = await this.userRepository.create(id, data);
    await this.preferencesRepository.create(id);

    return user;
  }

  async updateUser(id: string, data: UpdateUserPayload): Promise<UserModel> {
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    return this.userRepository.update(id, data);
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

    await this.userRepository.delete(id);
  }
}
