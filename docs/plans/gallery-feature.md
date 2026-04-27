# Gallery Feature — Phased Implementation Plan

## Genel Bakış

Galeri, uygulamanın asset yönetim ekranıdır. Kullanıcı fotoğraf ve belge yükleyebilir, kategorilere atayabilir, filtreler ile gezinebilir. Veri katmanı mevcut `AssetEntity` + yeni `AssetCategoryEntity` üzerine kurulur. Store normalized yapıyla scroll pagination kullanır.

---

## Mimari Kararlar

| Konu | Karar | Gerekçe |
|---|---|---|
| Store yapısı | `Record<id, Asset>` + `orderedIds: string[]` | O(1) update/delete, kolay merge |
| Pagination | Offset tabanlı `limit/offset` | SQLite'ta cursor'a gerek yok, `createdAt DESC` sıralaması sabit |
| Kategoriler | M:N junction tablo | Asset birden fazla kategoriye girebilir |
| Kategorisiz asset | "Tümü" filtresi hepsini gösterir | Ayrı "Diğer" filtresi opsiyonel |
| Storage silme | `deleteById` içinde FS + DB transaction | Asset silinince dosya da silinmeli |

---

## Phase 1 — Data Layer

> **Hedef:** Veritabanı schema hazır, TypeORM entegrasyonu tamamlanmış.

### 1.1 `features/asset/entity/asset-category.entity.ts` _(yeni)_

```ts
@Entity("asset_categories")
export class AssetCategoryEntity extends BaseEntity {
  @Column({ type: "text" })
  name!: string;

  @Column({ type: "text", nullable: true })
  icon?: string; // Lucide icon adı, e.g. "Car", "Wrench"

  @Column({ type: "integer", default: 0 })
  sortOrder!: number;

  @ManyToMany(() => AssetEntity, (asset) => asset.categories)
  assets?: AssetEntity[];
}
```

**Import bağımlılıkları:** `BaseEntity`, `AssetEntity`, `typeorm` dekoratörleri.

---

### 1.2 `features/asset/entity/asset.entity.ts` _(güncelleme)_

Mevcut entity'ye aşağıdaki alan eklenir:

```ts
@ManyToMany(() => AssetCategoryEntity, (cat) => cat.assets, {
  nullable: true,
  eager: false,
})
@JoinTable({
  name: "asset_category_map",
  joinColumn:        { name: "assetId",    referencedColumnName: "id" },
  inverseJoinColumn: { name: "categoryId", referencedColumnName: "id" },
})
categories?: AssetCategoryEntity[];
```

**Dikkat:** `@JoinTable` sadece owning side'da (AssetEntity) tanımlanır.

---

### 1.3 `db/db.ts` _(güncelleme)_

`entities` dizisine iki yeni entity eklenir:

```ts
import { AssetEntity }         from "@/features/asset/entity/asset.entity";
import { AssetCategoryEntity } from "@/features/asset/entity/asset-category.entity";
import { ImageMetadataEntity } from "@/features/asset/entity/metadata/image-metadata.entity";

entities: [UserPreferences, Vehicle, AssetEntity, AssetCategoryEntity, ImageMetadataEntity],
```

`synchronize: true` olduğu için migration gerekmez; uygulama açılışında tablolar otomatik oluşur.

---

### Phase 1 Doğrulama

- [ ] `npx tsc --noEmit` — tip hatası yok
- [ ] `AssetCategoryEntity` dekoratörlerini import'lar ile kontrol et

---

## Phase 2 — Service Layer

> **Hedef:** Tüm DB operasyonları servis katmanında kapsüllü.

### 2.1 `features/asset/service/asset-category.service.ts` _(yeni)_

```ts
export type CreateAssetCategoryDto = { name: string; icon?: string; sortOrder?: number };
export type UpdateAssetCategoryDto = Partial<CreateAssetCategoryDto>;

export class AssetCategoryService {
  private static async repo() { /* GetGaragelyDatabase().getRepository(AssetCategoryEntity) */ }

  /** Tüm kategoriler, sortOrder ASC */
  static async getAll(): Promise<AssetCategoryEntity[]>

  /** Yeni kategori */
  static async create(dto: CreateAssetCategoryDto): Promise<AssetCategoryEntity>

  /** Güncelleme */
  static async update(id: string, dto: UpdateAssetCategoryDto): Promise<AssetCategoryEntity>

  /** Silme — junction tablo otomatik temizlenir (TypeORM cascade) */
  static async delete(id: string): Promise<void>

  /**
   * Kategoriye asset ekle.
   * Zaten ekliyse no-op (INSERT OR IGNORE mantığı).
   */
  static async addAsset(categoryId: string, assetId: string): Promise<void>

  /** Kategoriden asset çıkar */
  static async removeAsset(categoryId: string, assetId: string): Promise<void>
}
```

**`addAsset` implementasyon notu:**
```ts
const category = await repo.findOne({ where: { id: categoryId }, relations: ["assets"] });
if (!category) throw new AppError(AssetCategoryErrors.CATEGORY_NOT_FOUND);
const asset = await assetRepo.findOneBy({ id: assetId });
if (!asset) throw new AppError(AssetErrors.FILE_NOT_FOUND_ERROR);
category.assets = [...(category.assets ?? []), asset];
await repo.save(category);
```

---

### 2.2 `features/asset/errors/asset-category.errors.ts` _(yeni)_

```ts
export const AssetCategoryErrors = {
  CATEGORY_NOT_FOUND: "CATEGORY_NOT_FOUND",
} as const;

export type AssetCategoryError = (typeof AssetCategoryErrors)[keyof typeof AssetCategoryErrors];
```

`AppError` union'ına `AssetCategoryError` eklenir: `shared/errors/app-error.ts` → `AppErrorCode` type.

---

### 2.3 `features/asset/service/asset.service.ts` _(güncelleme — yeni metodlar)_

Mevcut metod'lara dokunulmaz. Aşağıdakiler eklenir:

#### `getAll(limit: number, offset: number): Promise<AssetEntity[]>`
```ts
static async getAll(limit: number, offset: number): Promise<AssetEntity[]> {
  const repo = await AssetService.repo();
  return repo.find({
    order: { createdAt: "DESC" },
    take: limit,
    skip: offset,
    relations: ["categories"], // kategori chip filtresi için
  });
}
```

#### `getRecent(limit = 10): Promise<AssetEntity[]>`
```ts
static async getRecent(limit = 10): Promise<AssetEntity[]> {
  const repo = await AssetService.repo();
  return repo.find({
    order: { createdAt: "DESC" },
    take: limit,
  });
}
```

#### `getById(id: string): Promise<AssetEntity | null>`
```ts
static async getById(id: string): Promise<AssetEntity | null> {
  const repo = await AssetService.repo();
  return repo.findOne({ where: { id }, relations: ["categories", "imageMetadata"] });
}
```

#### `deleteById(id: string): Promise<void>`
```ts
static async deleteById(id: string): Promise<void> {
  const repo = await AssetService.repo();
  const asset = await repo.findOneBy({ id });
  if (!asset) throw AppError.createAppError(AssetErrors.FILE_NOT_FOUND_ERROR);

  // 1. FS dosyasını sil
  const storageAsset: StorageAsset = {
    baseName:  asset.baseName,
    extension: asset.extension,
    fullPath:  asset.fullPath,
    fullName:  asset.fullName,
    basePath:  asset.basePath,
    mimeType:  asset.mimeType,
    sizeBytes: asset.sizeBytes,
    isTemp:    false,
  };
  await ExpoFileSystemStorage.deleteFile(storageAsset);

  // 2. DB kaydını sil (junction tablo otomatik temizlenir)
  await repo.delete(id);
}
```

---

### Phase 2 Doğrulama

- [ ] `npx tsc --noEmit` — tip hatası yok
- [ ] `AppError` union'ı `AssetCategoryError` içeriyor

---

## Phase 3 — Store Layer

> **Hedef:** Galeri state'i tek store'da, normalized yapıda, scroll pagination hazır.

### 3.1 `stores/gallery.store.ts` _(yeni)_

#### Sabitler
```ts
const PAGE_SIZE = 20;
const RECENT_LIMIT = 10;
```

#### State & Actions tipi

```ts
interface GalleryState {
  // Asset map — O(1) lookup
  assetsById: Record<string, AssetEntity>;
  // Sıralı ID listesi — sayfalanmış, ekrana sırayla verilir
  orderedIds: string[];
  // Son Eklenenler şeridi için ID listesi
  recentIds: string[];
  // Pagination
  page: number;       // yüklenen sayfa sayısı
  hasMore: boolean;   // daha yüklenecek kayıt var mı
  isLoading: boolean;     // ilk yükleme
  isLoadingMore: boolean; // pagination yükleme
  // Kategoriler
  categories: AssetCategoryEntity[];
  categoriesLoading: boolean;
  // Aktif filtreler
  activeCategoryId: string | null; // null = Tümü
  activeTypeFilter: "all" | "media" | "documents"; // üst chip
}

interface GalleryActions {
  loadInitial: () => Promise<void>;
  loadMore: () => Promise<void>;
  loadCategories: () => Promise<void>;

  uploadImage: (uri: string) => Promise<AssetEntity>;
  deleteAsset: (id: string) => Promise<void>;

  addAssetToCategory: (assetId: string, categoryId: string) => Promise<void>;
  removeAssetFromCategory: (assetId: string, categoryId: string) => Promise<void>;

  setActiveCategory: (categoryId: string | null) => void;
  setTypeFilter: (filter: GalleryState["activeTypeFilter"]) => void;

  // Selectors (pure — Zustand store içinde tanımlı)
  getOrderedAssets: () => AssetEntity[];
  getRecentAssets: () => AssetEntity[];
  getFilteredAssets: () => AssetEntity[]; // activeCategoryId + activeTypeFilter
}
```

#### `loadInitial` implementasyonu

```ts
loadInitial: async () => {
  set({ isLoading: true });
  const [assets, recent, categories] = await Promise.all([
    AssetService.getAll(PAGE_SIZE, 0),
    AssetService.getRecent(RECENT_LIMIT),
    AssetCategoryService.getAll(),
  ]);
  const assetsById: Record<string, AssetEntity> = {};
  [...assets, ...recent].forEach((a) => { assetsById[a.id] = a; });
  set({
    assetsById,
    orderedIds: assets.map((a) => a.id),
    recentIds:  recent.map((a) => a.id),
    categories,
    page: 1,
    hasMore: assets.length === PAGE_SIZE,
    isLoading: false,
    categoriesLoading: false,
  });
},
```

#### `loadMore` implementasyonu

```ts
loadMore: async () => {
  const { isLoadingMore, hasMore, page } = get();
  if (isLoadingMore || !hasMore) return;
  set({ isLoadingMore: true });
  const assets = await AssetService.getAll(PAGE_SIZE, page * PAGE_SIZE);
  set((s) => ({
    assetsById: {
      ...s.assetsById,
      ...Object.fromEntries(assets.map((a) => [a.id, a])),
    },
    orderedIds: [...s.orderedIds, ...assets.map((a) => a.id)],
    page: page + 1,
    hasMore: assets.length === PAGE_SIZE,
    isLoadingMore: false,
  }));
},
```

#### `uploadImage` implementasyonu

```ts
uploadImage: async (uri) => {
  const asset = await AssetService.uploadImageAsset(uri);
  set((s) => ({
    assetsById: { [asset.id]: asset, ...s.assetsById },
    orderedIds: [asset.id, ...s.orderedIds],
    recentIds: [asset.id, ...s.recentIds].slice(0, RECENT_LIMIT),
  }));
  return asset;
},
```

#### `deleteAsset` implementasyonu

```ts
deleteAsset: async (id) => {
  await AssetService.deleteById(id);
  set((s) => {
    const { [id]: _removed, ...rest } = s.assetsById;
    return {
      assetsById: rest,
      orderedIds: s.orderedIds.filter((oid) => oid !== id),
      recentIds:  s.recentIds.filter((oid) => oid !== id),
    };
  });
},
```

#### `getFilteredAssets` selector

```ts
getFilteredAssets: () => {
  const { assetsById, orderedIds, activeCategoryId, activeTypeFilter } = get();
  let assets = orderedIds.map((id) => assetsById[id]).filter(Boolean);

  // Tip filtresi
  if (activeTypeFilter === "media") {
    assets = assets.filter((a) => a.type === AssetTypes.IMAGE || a.type === AssetTypes.VIDEO);
  } else if (activeTypeFilter === "documents") {
    assets = assets.filter((a) => a.type === AssetTypes.DOCUMENT);
  }

  // Kategori filtresi
  if (activeCategoryId !== null) {
    assets = assets.filter((a) =>
      a.categories?.some((c) => c.id === activeCategoryId),
    );
  }

  return assets;
},
```

---

### Phase 3 Doğrulama

- [ ] `npx tsc --noEmit` — tip hatası yok
- [ ] `loadInitial` çağrıldığında `assetsById`, `orderedIds`, `recentIds` dolduruluyor
- [ ] `loadMore` arka arkaya çağrıldığında ID'ler duplike oluşturmuyor
- [ ] `deleteAsset` sonrası store'da ilgili ID kalmıyor

---

## Phase 4 — i18n

> **Hedef:** EN ve TR çeviriler hazır, namespace kayıtlı.

### 4.1 `i18n/types/namespace.ts` _(güncelleme)_

```ts
export const TranslationNamespaces = {
  // ...mevcut
  GALLERY: "gallery",
} as const;
```

### 4.2 `i18n/locales/en/gallery.json` _(yeni)_

```json
{
  "title": "Gallery",
  "subtitle": "Your media and documents",

  "upload": "Upload",
  "uploadPhoto": "Upload Photo",

  "filters": {
    "all": "All",
    "media": "Media",
    "documents": "Documents"
  },

  "sections": {
    "recent": "Recent",
    "media": "Media",
    "documents": "Documents",
    "uncategorized": "Other"
  },

  "empty": {
    "title": "No assets yet",
    "subtitle": "Upload your first photo or document",
    "cta": "Upload"
  },

  "category": {
    "all": "All",
    "manage": "Manage Categories",
    "create": "New Category",
    "namePlaceholder": "Category name",
    "deleteConfirm": "Delete this category? Assets will not be deleted."
  },

  "errors": {
    "uploadFailed": "Upload failed. Please try again.",
    "deleteFailed": "Could not delete the asset."
  }
}
```

### 4.3 `i18n/locales/tr/gallery.json` _(yeni)_

```json
{
  "title": "Galeri",
  "subtitle": "Medya ve belgeleriniz",

  "upload": "Yükle",
  "uploadPhoto": "Fotoğraf Yükle",

  "filters": {
    "all": "Tümü",
    "media": "Medya",
    "documents": "Belgeler"
  },

  "sections": {
    "recent": "Son Eklenenler",
    "media": "Medya",
    "documents": "Belgeler",
    "uncategorized": "Diğer"
  },

  "empty": {
    "title": "Henüz dosya yok",
    "subtitle": "İlk fotoğraf veya belgenizi yükleyin",
    "cta": "Yükle"
  },

  "category": {
    "all": "Tümü",
    "manage": "Kategorileri Yönet",
    "create": "Yeni Kategori",
    "namePlaceholder": "Kategori adı",
    "deleteConfirm": "Bu kategori silinsin mi? Dosyalar silinmez."
  },

  "errors": {
    "uploadFailed": "Yükleme başarısız. Lütfen tekrar deneyin.",
    "deleteFailed": "Dosya silinemedi."
  }
}
```

### 4.4 i18n config _(güncelleme)_

`i18n/index.ts` veya config dosyasında `gallery` namespace resource olarak eklenir. Mevcut namespace'ler nasıl kayıtlıysa aynı pattern.

---

### Phase 4 Doğrulama

- [ ] `useI18n("gallery")` hook'u tip hatasız çalışıyor
- [ ] TR/EN key'leri eşleşiyor (eksik key yok)

---

## Phase 5 — UI Components

> **Hedef:** Her bileşen izole, store'dan props alır (store bağlantısı ekran katmanında).

### Dosya yapısı

```
features/gallery/
  components/
    GalleryFilterChips.tsx
    GalleryRecentStrip.tsx
    GalleryCategoryChips.tsx
    GalleryMediaGrid.tsx
    GalleryDocumentList.tsx
    GalleryEmpty.tsx
    GalleryUploadButton.tsx
```

---

### 5.1 `GalleryFilterChips.tsx`

**Props:**
```ts
type GalleryFilterChipsProps = {
  active: "all" | "media" | "documents";
  onChange: (v: "all" | "media" | "documents") => void;
};
```

**UI:** Yatay `ScrollView` içinde pill-style `Pressable`'lar. Aktif pill `theme.colors.primary` arka plan, pasif `theme.colors.muted`.

**Chip listesi:** `[{ key: "all", label: t("filters.all") }, { key: "media", ... }, { key: "documents", ... }]`

---

### 5.2 `GalleryRecentStrip.tsx`

**Props:**
```ts
type GalleryRecentStripProps = {
  assets: AssetEntity[];        // store'dan recentIds mapped
  onPressAsset: (id: string) => void;
};
```

**UI:**
- Section header: `t("sections.recent")`
- Yatay `FlatList`, `horizontal={true}`, `showsHorizontalScrollIndicator={false}`
- Her item: `80x80` kare thumbnail, `borderRadius`, `overflow: "hidden"`
- Image: `expo-image` `Image` komponenti, `source={{ uri: asset.fullPath }}`
- Liste boşsa bu component hiç render edilmez (`assets.length === 0 → null`)

---

### 5.3 `GalleryCategoryChips.tsx`

**Props:**
```ts
type GalleryCategoryChipsProps = {
  categories: AssetCategoryEntity[];
  activeId: string | null;        // null = Tümü
  onSelect: (id: string | null) => void;
};
```

**UI:** Yatay `ScrollView`. İlk chip her zaman `t("category.all")`, `activeId === null` ile aktif. Sonrasında kategoriler sırasıyla.

---

### 5.4 `GalleryMediaGrid.tsx`

**Props:**
```ts
type GalleryMediaGridProps = {
  assets: AssetEntity[];   // sadece IMAGE / VIDEO tipler
  onEndReached: () => void;
  onEndReachedThreshold?: number;
  isLoadingMore?: boolean;
  onPressAsset: (id: string) => void;
};
```

**UI:**
- `FlatList` ile `numColumns={3}`, `scrollEnabled={false}` _(dış ScrollView scroll eder)_
- Her item ekran genişliğinin `1/3`'ü kare (`(screenWidth - padding * 2) / 3`)
- `expo-image` `Image` bileşeni, `contentFit="cover"`
- Footer: `isLoadingMore` ise `ActivityIndicator`

**Not:** Dış `ScrollView`'in `onScroll` veya `onMomentumScrollEnd` üzerinden `onEndReached` tetiklenir (iç FlatList scroll etmediği için `onEndReached` çalışmaz). Bu bağlantı ekran katmanında yapılır.

---

### 5.5 `GalleryDocumentList.tsx`

**Props:**
```ts
type GalleryDocumentListProps = {
  assets: AssetEntity[];  // sadece DOCUMENT tipler
  onPressAsset: (id: string) => void;
};
```

**UI:**
- `FlatList`, `scrollEnabled={false}`
- Her item `AppListItem` pattern: sol ikon (`FileText` Lucide), label = `asset.fullName`, sub = `formatFileSize(asset.sizeBytes)`, sağ `ChevronRight`
- `scrollEnabled={false}` — dış ScrollView scroll eder

---

### 5.6 `GalleryEmpty.tsx`

**Props:**
```ts
type GalleryEmptyProps = {
  onUpload: () => void;
};
```

**UI:** Ortalanmış ikon (`ImagePlus`), başlık, açıklama, `AppButton` CTA.

---

### 5.7 `GalleryUploadButton.tsx`

**Props:**
```ts
type GalleryUploadButtonProps = {
  onPress: () => void;
};
```

**UI:** Header sağında `AppButton variant="ghost"` + `Plus` ikonu. Pressable, `ImagePicker` sheet açar.

---

### Phase 5 Doğrulama

- [ ] Her component `npx tsc --noEmit` geçiyor
- [ ] Unistyles `StyleSheet.create` kullanılıyor, hardcoded renk yok
- [ ] `App*` primitifleri kullanılıyor (raw `Text`, `View` yok)

---

## Phase 6 — Screen Assembly

> **Hedef:** Tüm component'lar bir araya gelir, store bağlantısı kurulur.

### 6.1 `features/gallery/screens/GalleryScreen.tsx` _(yeni)_

**Genel yapı:**

```tsx
export function GalleryScreen() {
  const store = useGalleryStore();
  const { t } = useI18n("gallery");

  useEffect(() => { store.loadInitial(); }, []);

  // Upload handler
  const handleUpload = () => {
    // ImagePicker sheet açılır
    // Seçilen uri → store.uploadImage(uri)
  };

  // Scroll sonu tespiti (dış ScrollView üzerinden)
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const isNearEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;
    if (isNearEnd) store.loadMore();
  };

  const orderedAssets    = store.getFilteredAssets();
  const recentAssets     = store.getRecentAssets();
  const mediaAssets      = orderedAssets.filter(a => a.type === AssetTypes.IMAGE || a.type === AssetTypes.VIDEO);
  const documentAssets   = orderedAssets.filter(a => a.type === AssetTypes.DOCUMENT);

  if (store.isLoading) return <ActivityIndicator />;

  return (
    <ScrollView onScroll={handleScroll} scrollEventThrottle={16}>
      {/* Header */}
      <View style={styles.header}>
        <AppText style={styles.title}>{t("title")}</AppText>
        <GalleryUploadButton onPress={handleUpload} />
      </View>

      {/* Tip Filtresi */}
      <GalleryFilterChips
        active={store.activeTypeFilter}
        onChange={store.setTypeFilter}
      />

      {/* Son Eklenenler Şeridi */}
      <GalleryRecentStrip
        assets={recentAssets}
        onPressAsset={(id) => { /* navigate to detail */ }}
      />

      {/* Kategori Chip'leri */}
      <GalleryCategoryChips
        categories={store.categories}
        activeId={store.activeCategoryId}
        onSelect={store.setActiveCategory}
      />

      {/* Medya Grid */}
      {mediaAssets.length > 0 && (
        <>
          <AppListSectionHeader title={t("sections.media")} />
          <GalleryMediaGrid
            assets={mediaAssets}
            onEndReached={store.loadMore}
            isLoadingMore={store.isLoadingMore}
            onPressAsset={(id) => { /* navigate to detail */ }}
          />
        </>
      )}

      {/* Belgeler */}
      {documentAssets.length > 0 && (
        <>
          <AppListSectionHeader title={t("sections.documents")} />
          <GalleryDocumentList
            assets={documentAssets}
            onPressAsset={(id) => { /* navigate to detail */ }}
          />
        </>
      )}

      {/* Boş Durum */}
      {orderedAssets.length === 0 && !store.isLoading && (
        <GalleryEmpty onUpload={handleUpload} />
      )}
    </ScrollView>
  );
}
```

---

### 6.2 `app/(tabs)/gallery.tsx` _(yeni)_

```tsx
import { GalleryScreen } from "@/features/gallery/screens/GalleryScreen";

export default function GalleryPage() {
  return <GalleryScreen />;
}
```

---

### Phase 6 Doğrulama

- [ ] Ekran render hatası almıyor
- [ ] `loadInitial` mount'ta çağrılıyor
- [ ] Scroll sonu `loadMore` tetikliyor (mock data ile test edilebilir)
- [ ] Upload flow: picker → `uploadImage` → `assetsById`'e eklendi

---

## Phase 7 — Navigation

> **Hedef:** Tab bar'a Gallery eklenir.

### 7.1 `app/(tabs)/_layout.tsx` _(güncelleme)_

`garage` ve `settings` arasına eklenir:

```tsx
<Tabs.Screen
  name="gallery"
  options={TabOptions({
    icon: "Images",
    title: "Gallery",
    theme,
  })}
/>
```

**Tab sırası:** `garage` → `gallery` → `settings`

---

### Phase 7 Doğrulama

- [ ] Tab bar'da "Gallery" görünüyor
- [ ] Tab'a tıklanınca `GalleryScreen` açılıyor
- [ ] Diğer tab'lar bozulmadı

---

## Phase 8 — Son Kontroller

### TypeScript
```bash
npx tsc --noEmit
```
Sıfır hata beklenir.

### Manuel Test Checklist

| Test | Beklenen |
|---|---|
| Uygulama ilk açılışında Gallery tab'ı görünür | ✓ |
| Galeri boşken empty state gösterilir | ✓ |
| Fotoğraf yüklenince grid'e eklenir, Son Eklenenler'de görünür | ✓ |
| 20+ fotoğraf varken scroll sonu `loadMore` tetiklenir | ✓ |
| "Medya" filtresi sadece image/video gösterir | ✓ |
| Kategori chip'ine tıklayınca sadece o kategorinin asset'leri listelenir | ✓ |
| "Tümü" chip'i tüm asset'leri geri getirir | ✓ |
| Kategorisiz asset "Tümü"nde görünür | ✓ |
| Asset silinince grid'den ve Son Eklenenler'den kalkar | ✓ |
| Dil değişince tüm labellar güncellenir | ✓ |
| Tema değişince renkler reaktif güncellenir | ✓ |

---

## Kritik Dosya Tablosu

| Dosya | İşlem | Phase |
|---|---|---|
| `features/asset/entity/asset-category.entity.ts` | **Yeni** | 1 |
| `features/asset/entity/asset.entity.ts` | ManyToMany ekle | 1 |
| `db/db.ts` | 3 entity ekle | 1 |
| `features/asset/errors/asset-category.errors.ts` | **Yeni** | 2 |
| `shared/errors/app-error.ts` | Union genişlet | 2 |
| `features/asset/service/asset-category.service.ts` | **Yeni** | 2 |
| `features/asset/service/asset.service.ts` | 4 metod ekle | 2 |
| `stores/gallery.store.ts` | **Yeni** | 3 |
| `i18n/types/namespace.ts` | GALLERY ekle | 4 |
| `i18n/locales/en/gallery.json` | **Yeni** | 4 |
| `i18n/locales/tr/gallery.json` | **Yeni** | 4 |
| `features/gallery/components/GalleryFilterChips.tsx` | **Yeni** | 5 |
| `features/gallery/components/GalleryRecentStrip.tsx` | **Yeni** | 5 |
| `features/gallery/components/GalleryCategoryChips.tsx` | **Yeni** | 5 |
| `features/gallery/components/GalleryMediaGrid.tsx` | **Yeni** | 5 |
| `features/gallery/components/GalleryDocumentList.tsx` | **Yeni** | 5 |
| `features/gallery/components/GalleryEmpty.tsx` | **Yeni** | 5 |
| `features/gallery/components/GalleryUploadButton.tsx` | **Yeni** | 5 |
| `features/gallery/screens/GalleryScreen.tsx` | **Yeni** | 6 |
| `app/(tabs)/gallery.tsx` | **Yeni** | 6 |
| `app/(tabs)/_layout.tsx` | Gallery tab ekle | 7 |

**Toplam:** 10 yeni dosya, 5 güncelleme
