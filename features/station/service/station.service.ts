import { GetGaragelyDatabase } from "@/db/db";
import { AssetEntity } from "@/features/asset/entity/asset.entity";
import { Station } from "@/features/station/entity/station.entity";
import { StationErrors } from "@/features/station/errors/station.errors";
import { StationType } from "@/features/station/types/station-type";
import { Tag } from "@/features/tag/entity/tag.entity";
import { TagService } from "@/features/tag/service/tag.service";
import { stationTagScope } from "@/features/station/utils/station-tag-scope";
import { AppError } from "@/shared/errors/app-error";
import { In } from "typeorm";

export interface CreateStationDto {
  name: string;
  type: StationType;
  brand?: string | null;
  address?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  website?: string | null;
  notes?: string | null;
  rating?: number | null;
  isFavorite?: boolean;
  coverAssetId?: string | null;
  mediaAssetIds?: string[];
  existingTagIds?: string[];
  newTagNames?: string[];
}

export type UpdateStationDto = Partial<CreateStationDto>;

const STATION_RELATIONS = ["cover", "media", "tags"];

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

function validateName(name: string) {
  const n = normalizeName(name);
  if (!n) throw AppError.createAppError(StationErrors.INVALID_STATION_NAME);
  return n;
}

function validateRating(rating: number | null | undefined): number | null {
  if (rating === undefined || rating === null) return null;
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw AppError.createAppError(StationErrors.INVALID_RATING);
  }
  return rating;
}

export class StationService {
  private static async repo() {
    const db = await GetGaragelyDatabase();
    return db.getRepository(Station);
  }

  static async getAll(): Promise<Station[]> {
    const repo = await StationService.repo();
    return repo.find({
      order: { createdAt: "DESC" },
      relations: ["cover", "tags"],
    });
  }

  static async getById(id: string): Promise<Station | null> {
    const repo = await StationService.repo();
    return repo.findOne({ where: { id }, relations: STATION_RELATIONS });
  }

  static async getByType(type: StationType): Promise<Station[]> {
    const repo = await StationService.repo();
    return repo.find({
      where: { type },
      order: { createdAt: "DESC" },
      relations: ["cover", "tags"],
    });
  }

  private static async resolveTags(
    type: StationType,
    existingTagIds: string[] | undefined,
    newTagNames: string[] | undefined,
  ): Promise<Tag[]> {
    const scope = stationTagScope(type);
    const tags: Tag[] = [];

    if (existingTagIds && existingTagIds.length > 0) {
      const existing = await TagService.getByIds(existingTagIds);
      tags.push(...existing.filter((t) => t.scope === scope));
    }

    if (newTagNames && newTagNames.length > 0) {
      for (const name of newTagNames) {
        const tag = await TagService.getOrCreate(name, scope);
        if (!tags.find((t) => t.id === tag.id)) tags.push(tag);
      }
    }

    return tags;
  }

  private static async resolveMedia(ids: string[] | undefined): Promise<AssetEntity[]> {
    if (!ids || ids.length === 0) return [];
    const db = await GetGaragelyDatabase();
    const repo = db.getRepository(AssetEntity);
    const assets = await repo.find({ where: { id: In(ids) } });
    // preserve order from input
    const byId = new Map(assets.map((a) => [a.id, a]));
    return ids.map((id) => byId.get(id)).filter((a): a is AssetEntity => !!a);
  }

  private static enforceCoverInvariant(
    media: AssetEntity[],
    coverAssetId: string | null | undefined,
  ): string | null {
    if (media.length === 0) return null;
    if (coverAssetId && media.some((m) => m.id === coverAssetId)) {
      return coverAssetId;
    }
    return media[0].id;
  }

  static async create(dto: CreateStationDto): Promise<Station> {
    const repo = await StationService.repo();

    const name = validateName(dto.name);
    const rating = validateRating(dto.rating);

    const media = await StationService.resolveMedia(dto.mediaAssetIds);
    const cover = StationService.enforceCoverInvariant(media, dto.coverAssetId ?? null);
    const tags = await StationService.resolveTags(
      dto.type,
      dto.existingTagIds,
      dto.newTagNames,
    );

    const station = repo.create({
      name,
      type: dto.type,
      brand: dto.brand ?? null,
      address: dto.address ?? null,
      city: dto.city ?? null,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
      phone: dto.phone ?? null,
      website: dto.website ?? null,
      notes: dto.notes ?? null,
      rating,
      isFavorite: dto.isFavorite ?? false,
      coverAssetId: cover,
      media,
      tags,
    });

    const saved = await repo.save(station);
    return (await repo.findOne({
      where: { id: saved.id },
      relations: STATION_RELATIONS,
    }))!;
  }

  static async update(id: string, dto: UpdateStationDto): Promise<Station> {
    const repo = await StationService.repo();
    const existing = await repo.findOne({
      where: { id },
      relations: STATION_RELATIONS,
    });
    if (!existing) {
      throw AppError.createAppError(StationErrors.STATION_NOT_FOUND);
    }

    if (dto.name !== undefined) existing.name = validateName(dto.name);
    if (dto.type !== undefined) existing.type = dto.type;
    if (dto.brand !== undefined) existing.brand = dto.brand;
    if (dto.address !== undefined) existing.address = dto.address;
    if (dto.city !== undefined) existing.city = dto.city;
    if (dto.latitude !== undefined) existing.latitude = dto.latitude;
    if (dto.longitude !== undefined) existing.longitude = dto.longitude;
    if (dto.phone !== undefined) existing.phone = dto.phone;
    if (dto.website !== undefined) existing.website = dto.website;
    if (dto.notes !== undefined) existing.notes = dto.notes;
    if (dto.rating !== undefined) existing.rating = validateRating(dto.rating);
    if (dto.isFavorite !== undefined) existing.isFavorite = dto.isFavorite;

    if (dto.mediaAssetIds !== undefined) {
      existing.media = await StationService.resolveMedia(dto.mediaAssetIds);
    }

    if (
      dto.mediaAssetIds !== undefined ||
      dto.coverAssetId !== undefined
    ) {
      const nextCover =
        dto.coverAssetId !== undefined ? dto.coverAssetId : existing.coverAssetId;
      existing.coverAssetId = StationService.enforceCoverInvariant(
        existing.media ?? [],
        nextCover ?? null,
      );
    }

    if (dto.existingTagIds !== undefined || dto.newTagNames !== undefined) {
      existing.tags = await StationService.resolveTags(
        existing.type,
        dto.existingTagIds,
        dto.newTagNames,
      );
    }

    await repo.save(existing);
    return (await repo.findOne({
      where: { id },
      relations: STATION_RELATIONS,
    }))!;
  }

  static async delete(id: string): Promise<void> {
    const repo = await StationService.repo();
    await repo.delete(id);
  }

  static async setCover(id: string, assetId: string | null): Promise<Station> {
    const repo = await StationService.repo();
    const station = await repo.findOne({
      where: { id },
      relations: STATION_RELATIONS,
    });
    if (!station) {
      throw AppError.createAppError(StationErrors.STATION_NOT_FOUND);
    }

    if (assetId) {
      const isInMedia = (station.media ?? []).some((m) => m.id === assetId);
      if (!isInMedia) {
        throw AppError.createAppError(StationErrors.MEDIA_NOT_IN_STATION);
      }
    }

    station.coverAssetId = StationService.enforceCoverInvariant(
      station.media ?? [],
      assetId,
    );
    await repo.save(station);
    return (await repo.findOne({ where: { id }, relations: STATION_RELATIONS }))!;
  }

  static async toggleFavorite(id: string): Promise<Station> {
    const repo = await StationService.repo();
    const station = await repo.findOneBy({ id });
    if (!station) {
      throw AppError.createAppError(StationErrors.STATION_NOT_FOUND);
    }
    station.isFavorite = !station.isFavorite;
    await repo.save(station);
    return (await repo.findOne({ where: { id }, relations: STATION_RELATIONS }))!;
  }
}
