# Station Feature — Implementation Plan (v2)

> Local-first istasyon yönetim feature'ı. Bu sürümde iki büyük değişiklik:
> 1. **Tag sistemi ayrı bir generic feature** olarak modellenir (`features/tag`) — ileride başka feature'lar da kullanır.
> 2. **Single cover photo yerine multi-asset media galerisi** — kullanıcı N tane image/video bağlar, birini cover seçer.

---

## 1. Hedef ve Kapsam

### Yapılacak
- 6 tip istasyon için CRUD + listeleme + detay
- Type-scoped tag sistemi, **generic Tag feature** üzerinden
- Generic Tag yönetim ekranı (tüm scope'lardaki tag'leri listele, sil)
- Multi-asset media galerisi (image + video), cover seçimi
- Cover photo davranışında Vehicle 3-kaynak pattern'i (library / camera / app gallery)
- Konum (lat/lng) alanları (UI sadece sayı input — harita yok)

### Kapsam dışı
- Harita / harita seçici
- Vehicle ↔ Station ilişkisi (servis geçmişi vb.)
- Vehicle'ı multi-asset modeline taşımak (Vehicle hâlâ single cover kalır)

---

## 2. Generic Tag Feature (`features/tag`)

Tag sistemi feature-agnostik. Birden fazla feature aynı tag mekanizmasını kullanabilsin diye **scope** kavramıyla soyutlanır.

### 2.1 Scope kavramı

Her tag bir `scope` string'ine aittir. Scope, feature'ın kendi belirlediği bir tanımlayıcı:
- Station için: `"station:GAS_STATION"`, `"station:MECHANIC"`, ...
- İleride Vehicle service records için olabilecek: `"vehicle-service:OIL_CHANGE"`
- Format **sözleşmesi**: `<feature>:<sub-scope>` — ama runtime'da sadece string

Her feature kendi scope helper'ını yazar:
```ts
// features/station/utils/station-tag-scope.ts
export const stationTagScope = (type: StationType) => `station:${type}`;
```

### 2.2 Entity

```ts
// features/tag/entity/tag.entity.ts
@Entity("tags")
@Unique("UQ_tag_name_per_scope", ["name", "scope"])
export class Tag extends BaseEntity {
  @Column("text") name: string;
  @Column("text") scope: string;       // feature'a göre şekillenir
}
```

Bilerek polymorphic join tablo yapmıyoruz — TypeORM'da temiz tipleme için her feature **kendi join tablosunu** tanımlar. `Tag` entity'si paylaşılır, `ManyToMany` ilişkisi feature-side'da tutulur.

### 2.3 Errors

```ts
// features/tag/errors/tag.errors.ts
export const TagErrors = {
  TAG_NOT_FOUND:           "TAG_NOT_FOUND",
  TAG_NAME_INVALID:        "TAG_NAME_INVALID",
  TAG_NAME_TOO_LONG:       "TAG_NAME_TOO_LONG",
  TAG_NAME_ALREADY_EXISTS: "TAG_NAME_ALREADY_EXISTS",
} as const;
```

### 2.4 Service

```ts
// features/tag/service/tag.service.ts
TagService.getByScope(scope: string): Promise<Tag[]>
TagService.getById(id: string): Promise<Tag | null>
TagService.getOrCreate(name: string, scope: string): Promise<Tag>
   // name normalize: trim + collapse spaces; case-insensitive uniqueness
TagService.rename(id: string, newName: string): Promise<Tag>
TagService.delete(id: string): Promise<void>
TagService.listScopes(): Promise<{ scope: string; count: number }[]>
   // tag yönetim ekranı için scope grupları
```

### 2.5 Generic UI: `TagInput`

```ts
// features/tag/components/TagInput.tsx
type TagInputProps = {
  scope: string;
  selectedExistingIds: string[];
  newTagNames: string[];
  onChange: (existingIds: string[], newNames: string[]) => void;
  labels: {
    addNewPlaceholder: string;
    addButton: string;
    suggestionsTitle: string;
    emptySuggestions: string;
  };
};
```

Davranış:
- `scope` değişince `TagService.getByScope(scope)` ile suggestion listesi yüklenir
- Üstte seçili chip'ler (mevcut + yeni — her ikisi de X ile kaldırılabilir)
- Altta input + "Ekle" butonu → newTagNames'e push (case-insensitive duplicate filtreli)
- Suggestion listesi: seçilmemiş tag'ler chip'ler halinde, tap → existingIds'e ekler
- "Yeni" tag'in adı suggestion listesinde varsa otomatik existingId'e dönüştürülür (kullanıcı farkında değil)

### 2.6 Tag Yönetim Ekranı

`features/tag/screens/tag-management/TagManagementScreen.tsx`

- `AppHeader` title="Etiketler"
- `TagService.listScopes()` ile gruplandı: `Station › Tamirci`, `Station › Benzin İstasyonu`, vb.
- Scope string'i human-readable label'a çevirmek için **kayıt sistemi**:

```ts
// features/tag/scope-registry.ts
type TagScopeLabelResolver = (subScope: string) => string;
const registry = new Map<string, TagScopeLabelResolver>();

export function registerTagScope(featurePrefix: string, resolver: TagScopeLabelResolver) {
  registry.set(featurePrefix, resolver);
}
export function resolveScopeLabel(scope: string, t: TFn): string {
  const [prefix, sub] = scope.split(":");
  const resolver = registry.get(prefix);
  return resolver ? resolver(sub) : scope;
}
```

Station feature `app/_layout.tsx` veya kendi init dosyasında:
```ts
registerTagScope("station", (sub) => i18n.t(`station:types.${sub}`));
```

- Her grup altında tag listesi: `AppListItem` (tag name, sağda tag'in kullanım sayısı), uzun bas → rename / delete
- Delete confirm Alert → `TagService.delete(id)` (join tabloları DB'de cascade veya app-level temizlik — aşağıda)

**Yönetim ekranı entry point**: Settings ekranına `AppListItem` eklenir → `/settings/tags` rotasına gider.

### 2.7 Tag silindiğinde join temizliği

`Tag` silinince ilgili feature'ların join tablolarındaki kayıt da düşmeli. İki yaklaşım:
- **A)** Her join tablosunda `ON DELETE CASCADE` (`tagId` foreign key) — temiz, DB-level
- **B)** App-level: `TagService.delete` öncesi tüm bağlı feature'ları gez

**Karar: A**. Her feature'ın join tablosu (`station_tags_on_stations` vb.) `tagId` üzerinden cascade tanımlar. Tag DB seviyesinde silinince join'ler de düşer. Generic kalır, performanslıdır.

### 2.8 i18n

Yeni namespace **`tag`** (`i18n/locales/{en,tr}/tag.json`):
- `management.title`, `management.empty`
- `actions.rename`, `actions.delete`, `actions.deleteConfirm`
- `errors.nameTooShort`, `errors.nameTooLong`, `errors.duplicate`

`errors.json` namespace'ine: `TAG_NOT_FOUND`, `TAG_NAME_ALREADY_EXISTS`, ...

---

## 3. Multi-Asset Media on Station

### 3.1 Veri modeli

```ts
@Entity("stations")
export class Station extends BaseEntity {
  // ... diğer alanlar

  @Column("uuid", { nullable: true }) coverAssetId: string | null;
  @ManyToOne(() => AssetEntity, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "coverAssetId" })
  coverAsset: AssetEntity | null;

  @ManyToMany(() => AssetEntity, { cascade: false })
  @JoinTable({
    name: "station_media_assets",
    joinColumn: { name: "stationId" },
    inverseJoinColumn: { name: "assetId" },
  })
  media: AssetEntity[];
}
```

**Invariantlar:**
- `coverAssetId` her zaman `media` listesindeki bir asset'in id'si **veya** `null` (boş listeyse).
- Boş `media` listesinde `coverAssetId === null` olmak zorunda.
- Tek media varsa otomatik cover olur.
- Cover olan media listesinden çıkarılırsa → kalanlardan ilki cover olur (yoksa null).

Kuralları service katmanında zorunlu kıl, UI'da göster.

### 3.2 Service mutasyonları

```ts
StationService.attachMedia(stationId, assetIds: string[]): Promise<Station>
   // varsa atla; yoksa join'e ekle; coverAssetId null'sa ilk asset'i cover yap
StationService.detachMedia(stationId, assetId): Promise<Station>
   // join'den kaldır; coverAssetId === assetId ise yeniden seç
StationService.setCover(stationId, assetId): Promise<Station>
   // assetId media listesinde değilse hata; aksi halde coverAssetId güncelle
```

**Önemli**: `detachMedia` sadece station ↔ asset bağını kırar; **AssetEntity'yi silmez**. Asset gallery'de kalır. Kullanıcı asset'i tamamen silmek istiyorsa Gallery üzerinden siler.

### 3.3 Form değerleri

Form'da media listesi geçici state olarak tutulur, submit'te service mutasyonlarına dönüşür:

```ts
type StationFormValues = {
  // ...
  mediaAssetIds: string[];        // join listesi (sıralama korunur — UI ordering)
  coverAssetId: string | null;
};
```

Submit akışı:
1. `StationService.create({...rest, mediaAssetIds, coverAssetId})` veya `update`
2. Service tek transaction'da: station kaydet → media join'ini set et → coverAssetId set et (validate)

Edit ekranında: form load'unda mevcut `media` ve `coverAssetId` state'e doldurulur; kullanıcı listeden çıkarsa state'ten düşer; submit'te yeni state servise gönderilir.

### 3.4 Yeni paylaşılan component: `AppMediaGalleryField`

`components/media-gallery-field/AppMediaGalleryField.tsx`

```ts
type MediaItem = { id: string; uri: string; type: "image" | "video" };

type AppMediaGalleryFieldProps = {
  value: MediaItem[];
  coverAssetId: string | null;
  onChange: (items: MediaItem[], coverAssetId: string | null) => void;
  labels: { /* tüm string'ler caller'dan */ };
};
```

UI:
- Üstte: cover slot (büyük 16:9, badge "Kapak" ile)
- Altta: kalan media'lar 3 sütun grid'i; video'larda sağ-alt köşede `Play` ikonu
- Sağ-alt sabit `+` FAB → media picker action sheet (3 kaynak)
- Bir media'ya tap → action sheet:
  - "Kapak yap" (cover değilse)
  - "Kaldır"
  - "Önizle" (image viewer / video player)

İç çalışma:
- Picker `useMediaPicker()` hook'u kullanır (aşağıda)
- `onChange` her değişimde çağrılır; cover yönetim kuralları (3.1) hook içinde uygulanır

### 3.5 `useMediaPicker` hook (paylaşılan logic)

`components/media-picker/use-media-picker.ts`

Vehicle pattern'inin (library / camera / app gallery + Alert warning) **özünü** içeren hook. Hem `AppCoverPhotoField` (Vehicle) hem `AppMediaGalleryField` (Station) bunu kullanır.

```ts
type UseMediaPickerOptions = {
  mediaTypes: "image" | "video" | "all";
  multiple?: boolean;
  aspect?: [number, number];
  labels: {
    pickFromLibrary: string;
    takePhoto: string;
    selectFromGallery: string;
    uploadWarningTitle: string;
    uploadWarningMessage: string;
    continueText: string;
    cancelText: string;
    pickerTitle: string;
  };
};

type PickedAsset = { id: string; uri: string; type: "image" | "video" };

function useMediaPicker(options: UseMediaPickerOptions): {
  open: (callback: (assets: PickedAsset[]) => void) => void;
  PickerModal: ReactNode;  // ekrana yerleştirilecek (galleryasset modal) — JSX olarak döner
};
```

Hook'un sorumluluğu:
1. `select-sheet` ile 3 seçenek
2. library/camera → Alert → `usePickedImage` ile uri al → `galleryStore.uploadImageToRoot` (image) veya video upload servisi → asset döndür
3. gallery → `GalleryAssetPickerModal` aç → kullanıcı seçer → asset döndür

Bu hook sayesinde `AppCoverPhotoField` (Vehicle, single) ve `AppMediaGalleryField` (Station, multi) aynı iç motoru paylaşır.

**Vehicle migration**: Mevcut `VehicleCoverPhotoField` `useMediaPicker` kullanacak şekilde refactor edilir; UI değişmez.

### 3.6 Gallery store'da video upload

Mevcut `galleryStore.uploadVideo(uri)` zaten var ama root upload yok — `galleryStore.uploadVideoToRoot(uri)` eklenir (image versiyonuyla simetrik).

---

## 4. Diğer Station Alanları (değişmeyen)

| Alan | Tip | Zorunlu |
|---|---|---|
| name | string | ✓ |
| type | StationType | ✓ |
| brand | string? | – |
| address | string? | – |
| city | string? | – |
| latitude / longitude | number? | – |
| phone | string? | – |
| website | string? | – |
| notes | text? | – |
| rating | 1–5 integer? | – |
| isFavorite | boolean | ✓ default false |
| coverAssetId | uuid? | – (3.1) |
| media | ManyToMany Asset | – (3.1) |
| tags | ManyToMany Tag (via station_tags_on_stations) | – |

### 4.1 StationType enum + metadata

(v1 plan'daki ile aynı — 6 tip + Lucide icon + theme renk eşlemesi.)

### 4.2 Station-side join entity'leri

```ts
// features/station/entity/station.entity.ts içinde:

@ManyToMany(() => Tag, { cascade: false })
@JoinTable({
  name: "station_tags_on_stations",
  joinColumn: { name: "stationId", onDelete: "CASCADE" },
  inverseJoinColumn: { name: "tagId", onDelete: "CASCADE" },
})
tags: Tag[];
```

Cascade: station silinince join düşer; tag silinince de join düşer.

### 4.3 `db.ts` entities güncellemesi

```ts
entities: [..., Station, Tag]
```

(`StationTag` ayrı entity yok — generic `Tag` kullanılıyor.)

---

## 5. Service'ler

### 5.1 `StationService`

```ts
getAll(): Promise<Station[]>                  // tags + coverAsset relations
getByType(type): Promise<Station[]>
getById(id): Promise<Station | null>           // tags + coverAsset + media relations
create(dto: CreateStationDto): Promise<Station>
update(id, dto: UpdateStationDto): Promise<Station>
delete(id): Promise<void>
toggleFavorite(id): Promise<Station>

attachMedia(id, assetIds[]): Promise<Station>
detachMedia(id, assetId): Promise<Station>
setCover(id, assetId): Promise<Station>
```

`CreateStationDto` / `UpdateStationDto` içinde:
- `tagIds: string[]` (form submit'te `TagService.getOrCreate` ile dönüştürülmüş hali)
- `mediaAssetIds: string[]`
- `coverAssetId: string | null`

`create`/`update` invariantları (3.1) zorunlu kılar; ihlalde domain hatası fırlatır.

---

## 6. Store

```ts
// stores/station.store.ts
type State = { stations: Station[]; isLoading: boolean };
type Actions = {
  load: () => Promise<void>;
  create: (dto) => Promise<Station>;
  update: (id, dto) => Promise<Station>;
  delete: (id) => Promise<void>;
  toggleFavorite: (id) => Promise<void>;
};
```

Tag store yok — `TagInput` doğrudan `TagService.getByScope`'u çağırır (anlık yükleme yeterli; tag listesi büyük olmaz).

---

## 7. UI: Form

### 7.1 Form değerleri

```ts
type StationFormValues = {
  name: string;
  type: StationType | "";
  brand: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  phone: string;
  website: string;
  notes: string;
  rating: number | null;
  isFavorite: boolean;

  mediaAssetIds: string[];
  coverAssetId: string | null;

  existingTagIds: string[];
  newTagNames: string[];
};
```

### 7.2 Layout

`AppFieldGroup`'lar:

1. **Media galerisi** (group dışı, üstte): `AppMediaGalleryField`
2. **`sections.basicInfo`**: name, type (sheet picker), brand, isFavorite (toggle)
3. **`sections.location`**: address, city, latitude, longitude
4. **`sections.contact`**: phone, website
5. **`sections.tags`**: `<TagInput scope={stationTagScope(type)} ... />` (type seçilmeden disabled)
6. **`sections.notes`**: notes (multiline), rating (5-star picker)

### 7.3 Type seçimi

`select-sheet` ile 6 tip listesi (icon + label). Type değişince:
- `existingTagIds = []`, `newTagNames = []` (scope değişti)
- Diğer alanlar dokunulmaz

### 7.4 Validation (Yup)

- `name` required, max 80
- `type` required
- `brand`, `address`, `city`, `phone`, `website`, `notes` optional + length sınırları
- `rating` optional 1..5 integer
- `latitude` -90..90; `longitude` -180..180
- `coverAssetId` ya null ya da `mediaAssetIds` içinde olmalı (Yup `.test`)

### 7.5 Submit akışı

```ts
const newTags = await Promise.all(
  values.newTagNames.map(n => TagService.getOrCreate(n, stationTagScope(values.type)))
);
const tagIds = [...values.existingTagIds, ...newTags.map(t => t.id)];

await stationStore.create({
  ...rest,
  tagIds,
  mediaAssetIds: values.mediaAssetIds,
  coverAssetId: values.coverAssetId,
});
```

---

## 8. UI: Detay

`features/station/screens/station-detail/StationDetailScreen.tsx`

Bölümler (yukarıdan aşağı):

1. **Hero**: `coverAsset` varsa 16:9 image. Yoksa tip ikonu + tip rengi placeholder.
2. **Title**: name; altında `brand` + tip badge.
3. **Favorite row**: `AppListItem` + `AppToggle`.
4. **`detail.specs`**: type, brand, rating (yıldızlar).
5. **`detail.location`** (varsa): address, city, lat/lng.
6. **`detail.contact`** (varsa): phone (`Linking.openURL("tel:...")`), website.
7. **`detail.tags`** (varsa): chip listesi.
8. **`detail.notes`** (varsa): multiline metin.
9. **`detail.media`** (cover hariç ≥1 media varsa): horizontal/grid thumbnail listesi. Tap → `AppImageViewer` (image) veya `AppVideoPlayer` (video — yoksa expo-av ile basit modal). Video preview için **yeni component**: `AppVideoPreviewModal` (sonraki sürüme ertelenebilir; bu sürümde sadece image preview yapacaksak tap-to-preview video için system player'ı `Linking.openURL(videoUri)` ile açabiliriz — basit fallback).

Header sağda Pencil + Trash2 (Vehicle pattern).

---

## 9. UI: Liste

`features/station/screens/station-list/StationListScreen.tsx`

- `AppHeader` title, sağda "+" → form ekranı
- En üstte tip filter chip'leri (All + 6 tip)
- `FlatList` + `StationListItem`:
  - Sol: cover thumb (yoksa tip rengi + ikon)
  - Sağ: name, brand • type, rating yıldız, fav star
- Tap → detail; uzun bas → `select-sheet` (favorite / edit / sil)
- Empty state: ikon + "Henüz istasyon eklemedin" + CTA

---

## 10. Routing

```
app/(tabs)/garage/station/
├── _layout.tsx                 → Stack
├── index.tsx                   → StationListScreen
└── [id]/
    ├── index.tsx               → StationDetailScreen
    └── station-form.tsx        → StationFormScreen (create + edit; id="new" için create)
```

Gallery'deki "İstasyonlar" `AppListItem` → `router.push("/garage/station")`.

Settings ekranına "Etiketler" `AppListItem` (Tag yönetimi) → `app/(tabs)/settings/tags.tsx` → `TagManagementScreen`.

---

## 11. Dosya Yapısı

```
features/tag/
├── entity/tag.entity.ts
├── errors/tag.errors.ts
├── service/tag.service.ts
├── components/TagInput.tsx
├── screens/tag-management/TagManagementScreen.tsx
├── scope-registry.ts
└── types.ts                    (Tag tip re-exportları, public surface)

features/station/
├── entity/station.entity.ts
├── errors/station.errors.ts
├── service/station.service.ts
├── types/station-type.ts
├── constants/station-type-meta.ts
├── utils/station-tag-scope.ts
├── components/
│   ├── StationListItem.tsx
│   ├── StationTypeFilterChips.tsx
│   └── StationTypeSheetItem.tsx
└── screens/
    ├── station-list/StationListScreen.tsx
    ├── station-form/
    │   ├── StationFormScreen.tsx
    │   ├── station-form-schema.ts
    │   └── sections/
    │       ├── BasicInfoSection.tsx
    │       ├── LocationSection.tsx
    │       ├── ContactSection.tsx
    │       ├── TagsSection.tsx
    │       └── NotesSection.tsx
    └── station-detail/
        ├── StationDetailScreen.tsx
        └── components/
            ├── StationHero.tsx
            └── StationMediaList.tsx

components/media-picker/
├── use-media-picker.tsx        (hook + 3-source action sheet logic)
└── types.ts

components/media-gallery-field/
└── AppMediaGalleryField.tsx    (multi-asset gallery + cover seçimi)

stores/
└── station.store.ts

app/(tabs)/garage/station/
├── _layout.tsx
├── index.tsx
└── [id]/
    ├── index.tsx
    └── station-form.tsx

app/(tabs)/settings/
└── tags.tsx                    (TagManagementScreen render)
```

### Refactor edilecek dosyalar
- `features/vehicle/components/VehicleCoverPhotoField.tsx` — `useMediaPicker` hook'una geçiş (UI aynı kalır)
- `stores/gallery.store.ts` — `uploadVideoToRoot` action eklenir

---

## 12. i18n

### Yeni namespace'ler
- **`tag`**: management ekranı + ortak tag string'leri
- **`station`**: tüm station feature

### `components` namespace eklenenler
- `mediaPicker.pickFromLibrary`, `mediaPicker.takePhoto`, `mediaPicker.selectFromGallery`
- `mediaPicker.uploadWarningTitle`, `mediaPicker.uploadWarningMessage`, `mediaPicker.continue`, `mediaPicker.cancel`
- `mediaGallery.addMedia`, `mediaGallery.setCover`, `mediaGallery.removeMedia`, `mediaGallery.preview`, `mediaGallery.coverBadge`

`vehicle:coverPhoto.*` mevcut anahtarları korunur — `VehicleCoverPhotoField` halen vehicle namespace'inden okuyup `useMediaPicker`'a forward eder.

### `errors.json`
Tag + Station tüm hata kodları eklenir.

### `TranslationNamespaces` enum
`TAG = "tag"`, `STATION = "station"` eklenir; `LanguageResources` kayıtları eklenir.

---

## 13. Implementation Sırası

1. **Generic Tag feature** (entity, errors, service, scope registry)
2. **`useMediaPicker` hook** + Vehicle adaptasyonu (regression test: vehicle cover photo aynı çalışmalı)
3. **`AppMediaGalleryField`** (Vehicle'da kullanılmıyor; yalnız Station için)
4. **Station foundation**: enum + metadata + entity + errors + db.ts kayıt
5. **`StationService`** (invariantlar dahil)
6. **`station.store.ts`**
7. **TagInput** (generic, Station form'unda kullanılacak)
8. **Station form**: schema + sections (media gallery dahil) + tag input + type sheet + rating
9. **Station list**: tip filter + liste + empty state
10. **Station detail** (hero + bölümler + media listesi alt bölüm)
11. **Routing** + gallery list item bağlantısı
12. **Tag yönetim ekranı** + Settings entry
13. **i18n** (TR + EN)
14. **CLAUDE.md güncelleme** (Tag feature + Station + AppMediaGalleryField + useMediaPicker + cover/media kuralları)
15. **`npx tsc --noEmit`** sıfır hata

---

## 14. Açık Karar Notları

- **Video preview**: Bu sürümde minimal — image için `AppImageViewer`, video için `Linking.openURL(uri)` (system player). `AppVideoPlayer` ileride.
- **Vehicle multi-asset migration**: Yapılmaz. Vehicle hâlâ tek cover (kullanıcı isterse sonra).
- **Tag silme join cascade**: DB seviyesinde `ON DELETE CASCADE` (her feature kendi join tablosunda tanımlar).
- **Tag rename**: Yönetim ekranında var; aynı scope'ta duplicate'ı engeller.
- **Cover invariantları service'te zorunlu**: UI bu kuralları gösterse de son söz service'te. Form geçici state'inde geçici olarak invalid duruma düşebilir, submit'te validate edilir.
- **`mediaAssetIds` sıralaması**: En son eklenen en başta (descending by attach order). Kullanıcı manuel reordering yapamaz bu sürümde. Cover slot her durumda en üstte (sıralamadan bağımsız).
- **Tag scope label resolver**: `registerTagScope("station", ...)` çağrısı `app/_layout.tsx`'te yapılır (i18n initialize sonrası).
