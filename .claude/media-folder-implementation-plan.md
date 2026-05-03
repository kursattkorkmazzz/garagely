# MediaFolder System — Implementation Plan

## Genel Bakış

`AssetCategoryEntity` (M:N etiket sistemi) kaldırılıp yerine **klasör ağacı** (`MediaFolderEntity`) getiriliyor.
Her asset tek bir klasörde bulunur (veya hiçbirinde → "Tüm Dosyalar" root).
Klasörler birbirinin içine sınırsız derinlikte yerleştirilebilir (self-referential tree).

---

## Mimari Kararlar

| Konu | Karar | Gerekçe |
|---|---|---|
| Asset ↔ Klasör ilişkisi | `AssetEntity.folderId` nullable FK | Bir asset sadece bir klasörde; sade query |
| Klasör ağacı | `parentId` nullable self-ref FK | SQLite'ta closure table gerekmez; sonsuz derinlik |
| Cascade delete | Uygulama katmanında recursive | TypeORM cascade SQLite'ta güvenilmez |
| Cascade delete UI | Warning: "X klasör, Y dosya silinecek" | Kullanıcı kararı vermeli |
| Döngüsel taşıma kontrolü | Taşıma öncesi ancestor check | Klasörü kendi alt klasörüne taşımayı engeller |
| Upload hedefi | `currentFolderId` store state | Kullanıcı neredeyse oraya yükler |
| Mevcut `AssetCategoryEntity` | Tamamen kaldırılır | Tüm referanslar temizlenir |
| Klasör adı validasyonu | `/[/\\:*?"<>|]/.test()` + boş/200 char | Asset rename ile aynı kural |

---

## Etkilenen Mevcut Dosyalar

| Dosya | Değişim |
|---|---|
| `features/asset/entity/asset-category.entity.ts` | **Silinir** |
| `features/asset/entity/asset.entity.ts` | `categories` M:N kaldır, `folderId` FK ekle |
| `features/asset/service/asset-category.service.ts` | **Silinir** |
| `features/asset/errors/asset-category.errors.ts` | **Silinir** (veya yeniden kullanılır) |
| `db/db.ts` | `AssetCategoryEntity` çıkar, `MediaFolderEntity` ekle |
| `stores/gallery.store.ts` | Klasör navigasyon state + action'ları eklenir |
| `features/gallery/screens/GalleryScreen.tsx` | Breadcrumb, FolderPlus butonu, klasör grid'i |
| `i18n/locales/en/gallery.json` | `folders` namespace ekle |
| `i18n/locales/tr/gallery.json` | `folders` namespace ekle |

---

## Phase 1 — Veri Katmanı

### 1.1 `features/asset/entity/media-folder.entity.ts` *(yeni)*

```ts
import { BaseEntity } from "@/db/entity/base.entity";
import type { AssetEntity } from "@/features/asset/entity/asset.entity";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";

@Entity("media_folders")
@Index(["parentId"])
export class MediaFolderEntity extends BaseEntity {
  @Column({ type: "text" })
  name!: string;

  @Column({ type: "text", nullable: true })
  parentId!: string | null;

  @ManyToOne("MediaFolderEntity", (f: MediaFolderEntity) => f.children, {
    nullable: true,
    onDelete: "CASCADE", // DB seviyesinde ek güvenlik
  })
  @JoinColumn({ name: "parentId" })
  parent?: MediaFolderEntity | null;

  @OneToMany("MediaFolderEntity", (f: MediaFolderEntity) => f.parent)
  children?: MediaFolderEntity[];

  @OneToMany("AssetEntity", (a: AssetEntity) => a.folder)
  assets?: AssetEntity[];
}
```

### 1.2 `features/asset/entity/asset.entity.ts` *(güncelleme)*

Kaldırılacaklar:
```ts
// Kaldır:
import type { AssetCategoryEntity } from "@/features/asset/entity/asset-category.entity";
import { JoinTable, ManyToMany } from "typeorm";
@ManyToMany(...)
@JoinTable(...)
categories?: AssetCategoryEntity[];
```

Eklenecekler:
```ts
import type { MediaFolderEntity } from "@/features/asset/entity/media-folder.entity";
import { JoinColumn, ManyToOne } from "typeorm";

@Column({ type: "text", nullable: true })
folderId!: string | null;

@ManyToOne("MediaFolderEntity", (f: MediaFolderEntity) => f.assets, {
  nullable: true,
  onDelete: "SET NULL",
})
@JoinColumn({ name: "folderId" })
folder?: MediaFolderEntity | null;
```

### 1.3 `db/db.ts` *(güncelleme)*

```ts
// Kaldır:
import { AssetCategoryEntity } from "@/features/asset/entity/asset-category.entity";

// Ekle:
import { MediaFolderEntity } from "@/features/asset/entity/media-folder.entity";

entities: [UserPreferences, Vehicle, AssetEntity, MediaFolderEntity, ImageMetadataEntity],
```

`synchronize: true` olduğu için:
- `media_folders` tablosu oluşturulur
- `assets.folderId` kolonu eklenir
- `asset_categories` ve `asset_category_map` tabloları DROP edilir (TypeORM synchronize davranışı)

> ⚠️ **Not:** Mevcut `asset_category_map` junction tablosu `synchronize` tarafından otomatik drop edilir.
> `AssetCategoryEntity` entities listesinden çıkarılınca TypeORM o tabloyu kaldırır.

---

## Phase 2 — Servis Katmanı

### 2.1 `features/asset/errors/media-folder.errors.ts` *(yeni)*

```ts
export const MediaFolderErrors = {
  FOLDER_NOT_FOUND:    "FOLDER_NOT_FOUND",
  CIRCULAR_REFERENCE:  "CIRCULAR_REFERENCE",
  NAME_ALREADY_EXISTS: "NAME_ALREADY_EXISTS_FOLDER",
  INVALID_NAME:        "INVALID_FOLDER_NAME",
  NAME_TOO_LONG:       "FOLDER_NAME_TOO_LONG",
} as const;

export type MediaFolderError =
  (typeof MediaFolderErrors)[keyof typeof MediaFolderErrors];
```

`shared/errors/app-error.ts` içindeki `AppErrorCode` union'ına `| MediaFolderError` eklenir.

### 2.2 `features/asset/service/media-folder.service.ts` *(yeni)*

```ts
export type CreateFolderDto = { name: string; parentId?: string | null };
export type RenameFolderDto = { name: string };
export type CascadeStats   = { folderCount: number; assetCount: number };

export class MediaFolderService {
  private static async repo() {
    return (await GetGaragelyDatabase()).getRepository(MediaFolderEntity);
  }

  // ─── Okuma ────────────────────────────────────────────────────────

  /** Root klasörler (parentId IS NULL) */
  static async getRootFolders(): Promise<MediaFolderEntity[]> {
    return (await this.repo()).find({
      where: { parentId: IsNull() },
      order: { name: "ASC" },
    });
  }

  /** Belirli bir klasörün alt klasörleri */
  static async getChildren(parentId: string): Promise<MediaFolderEntity[]> {
    return (await this.repo()).find({
      where: { parentId },
      order: { name: "ASC" },
    });
  }

  /** Breadcrumb için kök'e kadar ancestor zinciri (sıralı: root → leaf) */
  static async getFolderPath(folderId: string): Promise<MediaFolderEntity[]> {
    const path: MediaFolderEntity[] = [];
    const repo = await this.repo();
    let current = await repo.findOneBy({ id: folderId });
    while (current) {
      path.unshift(current);
      if (!current.parentId) break;
      current = await repo.findOneBy({ id: current.parentId });
    }
    return path;
  }

  /** Tekil klasör */
  static async getById(id: string): Promise<MediaFolderEntity | null> {
    return (await this.repo()).findOneBy({ id });
  }

  // ─── Yazma ────────────────────────────────────────────────────────

  /** Yeni klasör oluştur */
  static async create(dto: CreateFolderDto): Promise<MediaFolderEntity> {
    MediaFolderService.validateName(dto.name);
    const repo = await this.repo();

    // Aynı parent altında aynı isim kontrolü
    const exists = await repo.existsBy({
      parentId: dto.parentId ?? IsNull() as any,
      name: dto.name.trim(),
    });
    if (exists) {
      throw AppError.createAppError(MediaFolderErrors.NAME_ALREADY_EXISTS);
    }

    return repo.save(
      repo.create({ name: dto.name.trim(), parentId: dto.parentId ?? null }),
    );
  }

  /** Klasör adını değiştir */
  static async rename(id: string, dto: RenameFolderDto): Promise<MediaFolderEntity> {
    MediaFolderService.validateName(dto.name);
    const repo = await this.repo();
    const folder = await repo.findOneByOrFail({ id });

    // Aynı kardeş altında isim çakışma kontrolü
    const exists = await repo.existsBy({
      parentId: folder.parentId ?? IsNull() as any,
      name: dto.name.trim(),
    });
    if (exists) {
      throw AppError.createAppError(MediaFolderErrors.NAME_ALREADY_EXISTS);
    }

    await repo.update(id, { name: dto.name.trim() });
    return repo.findOneByOrFail({ id });
  }

  /**
   * Klasörü yeni bir parent'a taşı.
   * Döngüsel referans kontrolü: hedef klasör, taşınan klasörün alt ağacında olmamalı.
   */
  static async moveFolder(
    folderId: string,
    newParentId: string | null,
  ): Promise<MediaFolderEntity> {
    if (newParentId !== null) {
      const isDescendant = await MediaFolderService.isDescendant(
        newParentId,
        folderId,
      );
      if (isDescendant || newParentId === folderId) {
        throw AppError.createAppError(MediaFolderErrors.CIRCULAR_REFERENCE);
      }
    }
    const repo = await this.repo();
    await repo.update(folderId, { parentId: newParentId });
    return repo.findOneByOrFail({ id: folderId });
  }

  /**
   * Cascade silme için istatistik toplama.
   * Alt ağaçtaki toplam klasör ve asset sayısını döner.
   */
  static async getCascadeStats(folderId: string): Promise<CascadeStats> {
    const folderIds = await MediaFolderService.collectDescendantIds(folderId);
    const db = await GetGaragelyDatabase();
    const assetCount = await db
      .getRepository(AssetEntity)
      .createQueryBuilder("a")
      .where("a.folderId IN (:...ids)", { ids: [...folderIds, folderId] })
      .getCount();

    return {
      folderCount: folderIds.length, // alt klasörler (klasörün kendisi dahil değil)
      assetCount,
    };
  }

  /**
   * Klasörü ve tüm alt ağacını siler.
   * Asset'ler DB'den silinir, fiziksel dosyalar da temizlenir.
   * Araç entity referansları TypeORM onDelete: "SET NULL" ile sıfırlanır.
   */
  static async deleteCascade(folderId: string): Promise<void> {
    const allIds = [
      folderId,
      ...(await MediaFolderService.collectDescendantIds(folderId)),
    ];

    const db = await GetGaragelyDatabase();
    const assetRepo = db.getRepository(AssetEntity);
    const imgMetaRepo = db.getRepository(ImageMetadataEntity);
    const folderRepo = db.getRepository(MediaFolderEntity);

    // 1. Tüm alt ağaçtaki asset'lerin fiziksel dosyalarını sil
    const assets = await assetRepo
      .createQueryBuilder("a")
      .where("a.folderId IN (:...ids)", { ids: allIds })
      .getMany();

    for (const asset of assets) {
      try {
        await ExpoFileSystemStorage.deleteFile({
          fullPath: asset.fullPath,
          basePath: asset.basePath,
          baseName: asset.baseName,
          fullName: asset.fullName,
          extension: asset.extension,
          mimeType: asset.mimeType,
          sizeBytes: asset.sizeBytes,
          isTemp: false,
        });
      } catch {
        // Dosya yoksa sessizce geç
      }
    }

    // 2. ImageMetadata kayıtlarını sil
    const assetIds = assets.map((a) => a.id);
    if (assetIds.length > 0) {
      await imgMetaRepo
        .createQueryBuilder()
        .delete()
        .where("assetId IN (:...ids)", { ids: assetIds })
        .execute();
    }

    // 3. Asset DB kayıtlarını sil
    if (assetIds.length > 0) {
      await assetRepo
        .createQueryBuilder()
        .delete()
        .where("id IN (:...ids)", { ids: assetIds })
        .execute();
    }

    // 4. Klasörleri sil (leaf → root sırası; DB cascade zaten halleder ama explicit daha güvenli)
    //    allIds listesi folderId'yi içeriyor; DB ON DELETE CASCADE ile children otomatik silinir.
    await folderRepo.delete(folderId);
  }

  // ─── Yardımcılar ──────────────────────────────────────────────────

  private static validateName(name: string): void {
    const trimmed = name.trim();
    if (!trimmed) throw AppError.createAppError(MediaFolderErrors.INVALID_NAME);
    if (trimmed.length > 200) throw AppError.createAppError(MediaFolderErrors.NAME_TOO_LONG);
    if (/[/\\:*?"<>|]/.test(trimmed)) throw AppError.createAppError(MediaFolderErrors.INVALID_NAME);
  }

  /** folderId'nin targetId'nin alt ağacında olup olmadığını kontrol eder */
  private static async isDescendant(
    folderId: string,
    targetId: string,
  ): Promise<boolean> {
    const descendants = await MediaFolderService.collectDescendantIds(targetId);
    return descendants.includes(folderId);
  }

  /** targetId altındaki tüm alt klasör ID'lerini özyinelemeli toplar */
  private static async collectDescendantIds(parentId: string): Promise<string[]> {
    const repo = await this.repo();
    const children = await repo.find({
      select: { id: true },
      where: { parentId },
    });
    if (children.length === 0) return [];
    const ids = children.map((c) => c.id);
    const nested = await Promise.all(
      ids.map((id) => MediaFolderService.collectDescendantIds(id)),
    );
    return [...ids, ...nested.flat()];
  }
}
```

### 2.3 `features/asset/service/asset.service.ts` *(güncelleme)*

**`uploadAsset` metodunda `folderId` parametresi eklenir:**

```ts
private static async uploadAsset(
  uri: string,
  options: UploadAssetOptions & { folderId?: string | null },
) {
  // ...mevcut kod...
  newAsset.folderId = options.folderId ?? null;
  // ...
}

static async uploadImageAsset(uri, options?: Omit<UploadAssetOptions, "type"> & { folderId?: string | null }) { ... }
static async uploadVideoAsset(...)  { ... }
static async uploadDocumentAsset(...) { ... }
```

**Yeni metodlar:**

```ts
/** Klasördeki asset'leri getir (folderId null → klasörsüz asset'ler) */
static async getByFolder(
  folderId: string | null,
  limit: number,
  offset: number,
): Promise<AssetEntity[]> {
  const repo = await this.repo();
  return repo.find({
    where: { folderId: folderId ?? IsNull() },
    order: { createdAt: "DESC" },
    take: limit,
    skip: offset,
    relations: ["folder"],
  });
}

/** Asset'i bir klasöre taşı (folderId null → root'a taşı) */
static async moveAsset(
  assetId: string,
  targetFolderId: string | null,
): Promise<AssetEntity> {
  const repo = await this.repo();
  await repo.update(assetId, { folderId: targetFolderId });
  return repo.findOneByOrFail({ id: assetId });
}
```

**`getAll` metodu** `folderId` filtresi almadan tüm asset'leri döner (global "Tüm Dosyalar" için kalır).

---

## Phase 3 — Store: `stores/gallery.store.ts` *(güncelleme)*

### State Değişiklikleri

```ts
// Kaldır:
categories: AssetCategoryEntity[];
activeCategoryId: string | null;

// Ekle:
currentFolderId: string | null;       // null = root (Tüm Dosyalar)
folderPath: MediaFolderEntity[];      // breadcrumb için [root, ..., current]
subFolders: MediaFolderEntity[];      // mevcut klasörün alt klasörleri
```

### Action Değişiklikleri

```ts
// Kaldır:
loadCategories: () => Promise<void>;
addAssetToCategory: (assetId: string, categoryId: string) => Promise<void>;
removeAssetFromCategory: (assetId: string, categoryId: string) => Promise<void>;
setActiveCategory: (id: string | null) => void;

// Güncelle:
uploadImage: (uri: string, folderId?: string | null) => Promise<AssetEntity>;
uploadVideo: (uri: string, folderId?: string | null) => Promise<AssetEntity>;
uploadDocument: (uri: string, folderId?: string | null) => Promise<AssetEntity>;

// Ekle:
navigateToFolder: (folderId: string | null) => Promise<void>;
navigateBack: () => Promise<void>;
createFolder: (name: string) => Promise<MediaFolderEntity>;
renameFolder: (id: string, name: string) => Promise<void>;
moveFolder: (folderId: string, targetParentId: string | null) => Promise<void>;
moveAsset: (assetId: string, targetFolderId: string | null) => Promise<void>;
deleteFolderWithWarning: (id: string) => Promise<{ folderCount: number; assetCount: number }>;
deleteFolder: (id: string) => Promise<void>;
```

### Kritik Action Implementasyonları

**`loadInitial` güncellemesi:**
```ts
loadInitial: async () => {
  set({ isLoading: true });
  await AssetService.pruneOrphanedAssets();
  const [assets, recent, subFolders] = await Promise.all([
    AssetService.getAll(PAGE_SIZE, 0),       // tüm asset'ler (root için)
    AssetService.getRecent(RECENT_LIMIT),
    MediaFolderService.getRootFolders(),
  ]);
  // assetsById normalize...
  set({
    assetsById, orderedIds, recentIds,
    subFolders,
    folderPath: [],
    currentFolderId: null,
    page: 1, hasMore: ..., isLoading: false,
  });
},
```

**`navigateToFolder`:**
```ts
navigateToFolder: async (folderId) => {
  set({ isLoading: true });
  const [assets, subFolders, folderPath] = await Promise.all([
    folderId
      ? AssetService.getByFolder(folderId, PAGE_SIZE, 0)
      : AssetService.getAll(PAGE_SIZE, 0),
    folderId
      ? MediaFolderService.getChildren(folderId)
      : MediaFolderService.getRootFolders(),
    folderId
      ? MediaFolderService.getFolderPath(folderId)
      : Promise.resolve([]),
  ]);
  const assetsById: Record<string, AssetEntity> = {};
  assets.forEach((a) => { assetsById[a.id] = a; });
  set({
    currentFolderId: folderId,
    folderPath,
    subFolders,
    assetsById,
    orderedIds: assets.map((a) => a.id),
    page: 1,
    hasMore: assets.length === PAGE_SIZE,
    isLoading: false,
  });
},
```

**`navigateBack`:**
```ts
navigateBack: async () => {
  const { folderPath } = get();
  if (folderPath.length === 0) return; // zaten root'ta
  const parentId = folderPath.length >= 2
    ? folderPath[folderPath.length - 2].id
    : null;
  await get().navigateToFolder(parentId);
},
```

**`createFolder`:**
```ts
createFolder: async (name) => {
  const { currentFolderId } = get();
  const folder = await MediaFolderService.create({
    name,
    parentId: currentFolderId,
  });
  set((s) => ({ subFolders: [...s.subFolders, folder].sort(...) }));
  return folder;
},
```

**`deleteFolderWithWarning`** → stats döner; UI Alert gösterir, confirm gelince `deleteFolder` çağrılır:
```ts
deleteFolderWithWarning: async (id) => {
  return MediaFolderService.getCascadeStats(id);
},

deleteFolder: async (id) => {
  await MediaFolderService.deleteCascade(id);
  // State'ten klasörü ve içindeki asset'leri temizle
  set((s) => {
    const newAssetsById = { ...s.assetsById };
    const removedIds = s.orderedIds.filter(
      (aid) => newAssetsById[aid]?.folderId === id,
    );
    removedIds.forEach((aid) => delete newAssetsById[aid]);
    return {
      subFolders: s.subFolders.filter((f) => f.id !== id),
      assetsById: newAssetsById,
      orderedIds: s.orderedIds.filter((aid) => !removedIds.includes(aid)),
      recentIds:  s.recentIds.filter((rid)  => !removedIds.includes(rid)),
    };
  });
},
```

**`uploadImage` / `uploadVideo` / `uploadDocument`** → `currentFolderId` otomatik geçilir:
```ts
uploadImage: async (uri, folderId) => {
  const { currentFolderId } = get();
  const asset = await AssetService.uploadImageAsset(uri, {
    folderId: folderId ?? currentFolderId,
  });
  set((s) => ({
    assetsById: { [asset.id]: asset, ...s.assetsById },
    orderedIds: [asset.id, ...s.orderedIds],
    recentIds:  [asset.id, ...s.recentIds].slice(0, RECENT_LIMIT),
  }));
  return asset;
},
```

### `getFilteredAssets` güncellemesi

```ts
getFilteredAssets: () => {
  const { assetsById, orderedIds, activeTypeFilter } = get();
  // activeCategoryId kaldırıldı; klasör filtresi navigateToFolder ile yapılır
  let assets = orderedIds.map((id) => assetsById[id]).filter(Boolean);
  if (activeTypeFilter === "media")
    assets = assets.filter((a) => a.type === AssetTypes.IMAGE || a.type === AssetTypes.VIDEO);
  else if (activeTypeFilter === "documents")
    assets = assets.filter((a) => a.type === AssetTypes.DOCUMENT);
  return assets;
},
```

---

## Phase 4 — UI Bileşenleri

### 4.1 `features/gallery/components/GalleryBreadcrumb.tsx` *(yeni)*

```ts
type Props = {
  path: MediaFolderEntity[];   // [root, ..., current]
  onNavigate: (folderId: string | null) => void;
};
```

- Yatay `ScrollView`, her item `Pressable` + `AppText`
- İlk item: "Tüm Dosyalar" (onNavigate(null))
- Aralarında `ChevronRight` ikonu (Lucide)
- Aktif (son) item bold, diğerleri `mutedForeground`
- `path.length === 0` → sadece "Tüm Dosyalar" gösterilir (tıklanamaz/pasif)

### 4.2 `features/gallery/components/GalleryFolderGrid.tsx` *(yeni)*

```ts
type Props = {
  folders: MediaFolderEntity[];
  isSelecting: boolean;
  selectedIds: Set<string>;      // şimdilik klasörler seçilemez → prop yine de alır
  onPressFolder: (id: string) => void;
  onLongPressFolder: (id: string) => void;
};
```

- `FlatList numColumns={3}`, `scrollEnabled={false}`
- Her item: `Folder` ikonu (Lucide, büyük), alt satırda klasör adı (truncate 1 satır)
- Long press → action sheet: Yeniden Adlandır / Taşı / Sil
- Grid item boyutu asset grid ile aynı (tutarlı görünüm)

### 4.3 `features/gallery/components/GalleryCreateFolderModal.tsx` *(yeni)*

```ts
type Props = {
  visible: boolean;
  onSave: (name: string) => Promise<void>;
  onClose: () => void;
};
```

- `GalleryRenameModal` ile aynı pattern (Modal + AppInputGroup + AppInputField)
- Sadece isim inputu; extension suffix yok
- Error handling: `NAME_ALREADY_EXISTS` → inline hata mesajı

### 4.4 `features/gallery/components/GalleryFolderPickerModal.tsx` *(yeni)*

```ts
type Props = {
  visible: boolean;
  title: string;                 // "Klasör Seç" veya "Taşı"
  currentFolderId?: string | null;  // Hariç tutulacak klasör (döngüsellik)
  onSelect: (folderId: string | null) => void;
  onClose: () => void;
};
```

- Full-screen Modal (slide)
- Gezinebilir klasör ağacı: breadcrumb + alt klasör listesi
- "Bu Klasörü Seç" primary button (her seviyede)
- "Buraya Taşı" = seçili konuma taşı
- `currentFolderId` olan klasör disabled gösterilir (taşınan klasörün kendisi)

### 4.5 `features/gallery/screens/GalleryScreen.tsx` *(güncelleme)*

**Header değişikliği:**
```tsx
// Mevcut Upload butonu yanına FolderPlus butonu ekle
<AppButton variant="ghost" size="icon" onPress={() => setCreateFolderVisible(true)}>
  <FolderPlus size={20} color={theme.colors.primary} />
</AppButton>
<AppButton variant="ghost" size="icon" onPress={handleUpload}>
  <Upload size={20} color={theme.colors.primary} />
</AppButton>
```

**Breadcrumb eklenir (FilterChips üzerinde):**
```tsx
<GalleryBreadcrumb
  path={store.folderPath}
  onNavigate={store.navigateToFolder}
/>
```

**Alt klasörler grid üstünde gösterilir:**
```tsx
{store.subFolders.length > 0 && (
  <>
    <AppListSectionHeader title={t("folders.title")} />
    <GalleryFolderGrid
      folders={store.subFolders}
      isSelecting={store.isSelecting}
      selectedIds={store.selectedIds}
      onPressFolder={(id) => store.navigateToFolder(id)}
      onLongPressFolder={handleLongPressFolder}
    />
  </>
)}
```

**Long press folder handler:**
```ts
const handleLongPressFolder = (id: string) => {
  const folder = store.subFolders.find((f) => f.id === id);
  if (!folder) return;
  SheetManager.show("select-sheet", {
    payload: {
      sections: [{
        data: [
          { key: "rename", label: t("itemActions.rename"), icon: "Pencil" },
          { key: "move",   label: t("folders.move"),       icon: "FolderInput" },
          { key: "delete", label: t("itemActions.delete"), icon: "Trash2" },
        ],
      }],
      renderItem: ({ item }: any) => (
        <SelectItem label={item.label} onPress={() => {
          SheetManager.hide("select-sheet");
          if (item.key === "rename") {
            setRenameFolderTarget({ id, name: folder.name });
          } else if (item.key === "move") {
            setMoveFolderTarget(id);
          } else if (item.key === "delete") {
            handleDeleteFolder(id);
          }
        }} />
      ),
    },
  });
};
```

**Klasör silme — cascade warning:**
```ts
const handleDeleteFolder = async (id: string) => {
  const stats = await store.deleteFolderWithWarning(id);
  const msg = t("folders.deleteConfirmMessage", {
    folderCount: stats.folderCount,
    assetCount: stats.assetCount,
  });
  Alert.alert(t("folders.deleteConfirmTitle"), msg, [
    { text: t("selection.cancel"), style: "cancel" },
    {
      text: t("selection.delete"),
      style: "destructive",
      onPress: () => store.deleteFolder(id).catch(handleUIError),
    },
  ]);
};
```

**Yeni state'ler GalleryScreen'e:**
```ts
const [createFolderVisible, setCreateFolderVisible] = useState(false);
const [renameFolderTarget, setRenameFolderTarget] = useState<{ id: string; name: string } | null>(null);
const [moveFolderTarget, setMoveFolderTarget] = useState<string | null>(null);   // taşınacak folder id
const [moveAssetTarget, setMoveAssetTarget] = useState<string | null>(null);     // taşınacak asset id
```

**Long press asset action sheet'e "Taşı" eklenir:**
```ts
{ key: "move", label: t("folders.moveAsset"), icon: "FolderInput" },
```

**Modal'lar render:**
```tsx
<GalleryCreateFolderModal
  visible={createFolderVisible}
  onSave={async (name) => {
    await store.createFolder(name);
    setCreateFolderVisible(false);
  }}
  onClose={() => setCreateFolderVisible(false)}
/>

{/* Klasör yeniden adlandırma — GalleryRenameModal yeniden kullanılır */}
<GalleryRenameModal
  visible={renameFolderTarget !== null}
  currentBaseName={renameFolderTarget?.name ?? ""}
  extension=""   // klasörde extension yok
  onSave={async (newName) => {
    await store.renameFolder(renameFolderTarget!.id, newName);
    setRenameFolderTarget(null);
  }}
  onClose={() => setRenameFolderTarget(null)}
/>

<GalleryFolderPickerModal
  visible={moveFolderTarget !== null}
  title={t("folders.moveFolder")}
  currentFolderId={moveFolderTarget}
  onSelect={async (targetId) => {
    await store.moveFolder(moveFolderTarget!, targetId).catch(handleUIError);
    setMoveFolderTarget(null);
  }}
  onClose={() => setMoveFolderTarget(null)}
/>

<GalleryFolderPickerModal
  visible={moveAssetTarget !== null}
  title={t("folders.moveAsset")}
  onSelect={async (targetId) => {
    await store.moveAsset(moveAssetTarget!, targetId).catch(handleUIError);
    setMoveAssetTarget(null);
  }}
  onClose={() => setMoveAssetTarget(null)}
/>
```

---

## Phase 5 — i18n

### `en/gallery.json` eklentileri

```json
"folders": {
  "title": "Folders",
  "allFiles": "All Files",
  "move": "Move",
  "moveFolder": "Move Folder",
  "moveAsset": "Move File",
  "createFolder": "New Folder",
  "renameFolder": "Rename Folder",
  "deleteConfirmTitle": "Delete Folder?",
  "deleteConfirmMessage": "{{folderCount}} sub-folder(s) and {{assetCount}} file(s) will be permanently deleted.",
  "errors": {
    "notFound": "Folder not found.",
    "circularReference": "Cannot move a folder into its own subfolder.",
    "nameAlreadyExists": "A folder with this name already exists.",
    "invalidName": "Folder name contains invalid characters.",
    "nameTooLong": "Folder name is too long."
  }
},
"itemActions": {
  "select": "Select",
  "rename": "Rename",
  "move": "Move",
  "delete": "Delete"
}
```

### `tr/gallery.json` eklentileri

```json
"folders": {
  "title": "Klasörler",
  "allFiles": "Tüm Dosyalar",
  "move": "Taşı",
  "moveFolder": "Klasörü Taşı",
  "moveAsset": "Dosyayı Taşı",
  "createFolder": "Yeni Klasör",
  "renameFolder": "Klasörü Yeniden Adlandır",
  "deleteConfirmTitle": "Klasör Silinsin mi?",
  "deleteConfirmMessage": "{{folderCount}} alt klasör ve {{assetCount}} dosya kalıcı olarak silinecek.",
  "errors": {
    "notFound": "Klasör bulunamadı.",
    "circularReference": "Klasör kendi alt klasörüne taşınamaz.",
    "nameAlreadyExists": "Bu isimde bir klasör zaten var.",
    "invalidName": "Klasör adı geçersiz karakter içeriyor.",
    "nameTooLong": "Klasör adı çok uzun."
  }
},
"itemActions": {
  "select": "Seç",
  "rename": "Yeniden Adlandır",
  "move": "Taşı",
  "delete": "Sil"
}
```

---

## Dosya Tablosu

| Dosya | İşlem | Phase |
|---|---|---|
| `features/asset/entity/asset-category.entity.ts` | **Silinir** | 1 |
| `features/asset/entity/media-folder.entity.ts` | **Yeni** | 1 |
| `features/asset/entity/asset.entity.ts` | categories kaldır, folderId ekle | 1 |
| `db/db.ts` | AssetCategoryEntity çıkar, MediaFolderEntity ekle | 1 |
| `features/asset/errors/media-folder.errors.ts` | **Yeni** | 2 |
| `features/asset/errors/asset-category.errors.ts` | **Silinir** | 2 |
| `shared/errors/app-error.ts` | MediaFolderError ekle, AssetCategoryError çıkar | 2 |
| `features/asset/service/media-folder.service.ts` | **Yeni** | 2 |
| `features/asset/service/asset-category.service.ts` | **Silinir** | 2 |
| `features/asset/service/asset.service.ts` | folderId param, getByFolder, moveAsset | 2 |
| `features/asset/types/asset.service.type.ts` | `folderId` UploadAssetOptions'a ekle | 2 |
| `stores/gallery.store.ts` | Klasör state + action'ları | 3 |
| `features/gallery/components/GalleryBreadcrumb.tsx` | **Yeni** | 4 |
| `features/gallery/components/GalleryFolderGrid.tsx` | **Yeni** | 4 |
| `features/gallery/components/GalleryCreateFolderModal.tsx` | **Yeni** | 4 |
| `features/gallery/components/GalleryFolderPickerModal.tsx` | **Yeni** | 4 |
| `features/gallery/components/GalleryCategoryChips.tsx` | **Silinir** | 4 |
| `features/gallery/screens/GalleryScreen.tsx` | Breadcrumb, folder grid, modal'lar | 4 |
| `i18n/locales/en/gallery.json` | `folders` namespace ekle | 5 |
| `i18n/locales/tr/gallery.json` | `folders` namespace ekle | 5 |

**Toplam:** 8 yeni dosya · 9 güncelleme · 5 silme

---

## Doğrulama Kontrol Listesi

### Phase 1 — DB
- [ ] Uygulama açılışında `media_folders` tablosu oluşturuldu
- [ ] `assets` tablosuna `folderId` kolonu eklendi
- [ ] `asset_categories` ve `asset_category_map` tabloları drop edildi
- [ ] `npx tsc --noEmit` sıfır hata

### Phase 2 — Servis
- [ ] Root klasör oluşturulabiliyor
- [ ] Alt klasör oluşturulabiliyor
- [ ] Klasör yeniden adlandırılabiliyor
- [ ] Aynı isimde kardeş klasör oluşturulamıyor (NAME_ALREADY_EXISTS)
- [ ] Klasör kendine veya alt klasörüne taşınamıyor (CIRCULAR_REFERENCE)
- [ ] `getCascadeStats` doğru sayı döndürüyor
- [ ] `deleteCascade`: alt klasörler, asset DB kayıtları ve fiziksel dosyalar siliniyor
- [ ] Asset bir klasöre taşınabiliyor (`moveAsset`)
- [ ] Upload ederken `folderId` asset'e atanıyor

### Phase 3 — Store
- [ ] `loadInitial` root klasörleri ve asset'leri yüklüyor
- [ ] `navigateToFolder` breadcrumb ve alt klasörleri güncelliyor
- [ ] `navigateBack` bir üst seviyeye çıkıyor
- [ ] `createFolder` mevcut klasöre ekliyor, state güncelleniyor
- [ ] `deleteFolder` state'ten klasörü ve içindeki asset'leri temizliyor
- [ ] Upload → `currentFolderId`'ye gidiyor

### Phase 4 — UI
- [ ] Breadcrumb root'ta "Tüm Dosyalar" gösteriyor
- [ ] Klasöre tıklayınca içine giriliyor, breadcrumb güncelleniyor
- [ ] Geri navigasyon çalışıyor
- [ ] FolderPlus butonu → klasör oluşturma modal
- [ ] Klasöre long press → Yeniden Adlandır / Taşı / Sil action sheet
- [ ] Sil → cascade warning sayıları doğru
- [ ] Asset long press → Taşı seçeneği çalışıyor
- [ ] FolderPickerModal döngüsel seçimi engelliyor
