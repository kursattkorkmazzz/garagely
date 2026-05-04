# Plan: Araç Kapak Fotoğrafı (Vehicle Cover Photo)

## Genel Bakış

Araç ekleme ve güncelleme formuna kapak fotoğrafı özelliği ekleniyor. Kullanıcı üç kaynaktan fotoğraf seçebilir: cihaz galerisi, kamera ve uygulama galerisi. Cihaz/kamera seçiminde kullanıcı uyarılır. Araç güncellemede eski kapak fotoğrafının galeride tutulup tutulmayacağı sorulur.

---

## Mimari Kararlar

| Konu | Karar | Gerekçe |
|---|---|---|
| Upload zamanlaması | Seçim anında hemen yükle (submit öncesi) | Asset ID form kaydedilmeden gerekli; kullanıcı uyarıyı zaten onayladı |
| Root upload | Yeni `uploadImageToRoot(uri)` action | `uploadImage` mevcut `currentFolderId`'yi kullanıyor; cover photo her zaman root'a gitmeli |
| Asset picker pattern | `GalleryFolderPickerModal` ile aynı | Local state + direkt service çağrısı (mevcut pattern) |
| Old photo cleanup | Kaydet _sonrası_ Alert | Silme isteğe bağlı; form kayıt akışını bloke etmemeli |
| Preview URI | Form state'inde `coverPhotoPreviewUri` | Servis çağrısı olmadan anlık render; `vehicleToFormValues` zamanında doldurulur |
| DTO genişletme | Otomatik | `CreateVehicleDto = Omit<Vehicle, "id"|"createdAt"|"updateAt">` — entity'ye eklemek yeter |

---

## Ekran Akışı

### Yeni araç — cover photo seçimi

```
[Kapak fotoğrafı alanına tap]
       │
       ▼
[Action Sheet]
  ├─ Cihazdan Yükle ──► Alert("Galeriye eklenecek") ──► [İptal] / [Devam Et]
  │                                                              │
  │                                                        expo-image-picker (library)
  │                                                              │
  ├─ Kamera ile Çek ──► Alert("Galeriye eklenecek") ──► [İptal] / [Devam Et]
  │                                                              │
  │                                                        expo-image-picker (camera)
  │                                                              │
  └─ Galeriden Seç ──────────────────────────────────► GalleryAssetPickerModal
                                                              │
                                                    [asset seç → tap]
                                                              │
                                               uploadImageToRoot(uri) → AssetEntity
                                                              │
                                                 onUploadComplete(assetId, previewUri)
                                                              │
                                                   Form: coverPhotoAssetId, previewUri
```

### Araç güncelleme — cover photo değişimi

```
[Yeni fotoğraf seç] ──► (yukarıdaki akış)
       │
[Form kaydet]
       │
[update() başarılı]
       │
[previousCoverPhotoAssetId !== null && !== yeni assetId?]
       │                │
      Hayır            Evet
       │                │
   router.back()   Alert("Eski fotoğraf galeride kalsın mı?")
                        ├─ "Galeride Kalsın" ──► router.back()
                        └─ "Galeriden Kaldır" ──► galleryStore.deleteAsset(oldId) → router.back()
```

---

## Phase 1 — Data Layer

### 1.1 `features/vehicle/entity/vehicle.entity.ts` _(güncelleme)_

Mevcut `purchaseDate` alanının altına ekle:

```ts
import { AssetEntity } from "@/features/asset/entity/asset.entity";
import { JoinColumn, ManyToOne } from "typeorm";

@Column({ type: "text", nullable: true })
coverPhotoAssetId?: string | null;

@ManyToOne(() => AssetEntity, { nullable: true, onDelete: "SET NULL", eager: false })
@JoinColumn({ name: "coverPhotoAssetId" })
coverPhoto?: AssetEntity | null;
```

> `synchronize: true` olduğu için migration gerekmez. Sütun otomatik oluşur.

### 1.2 `features/vehicle/service/vehicle.service.ts` _(güncelleme)_

`getById` metodunu güncelle:

```ts
static async getById(id: string): Promise<Vehicle | null> {
  const repo = await VehicleService.repo();
  return repo.findOne({ where: { id }, relations: ["coverPhoto"] });
}
```

> `CreateVehicleDto = Omit<Vehicle, "id" | "createdAt" | "updateAt">` pattern'i sayesinde `coverPhotoAssetId` DTO'ya otomatik dahil olur. `create` ve `update` metodlarında başka değişiklik gerekmez.

---

## Phase 2 — Gallery Store Extension

### 2.1 `stores/gallery.store.ts` _(güncelleme)_

**`GalleryActions` interface'ine ekle:**

```ts
uploadImageToRoot: (uri: string) => Promise<AssetEntity>;
```

**Implementasyon (mevcut `uploadImage` action'ının hemen altına):**

```ts
uploadImageToRoot: async (uri) => {
  const asset = await AssetService.uploadImageAsset(uri, { folderId: null });
  set((s) => ({
    assetsById: { [asset.id]: asset, ...s.assetsById },
    // Root görünümdeyken orderedIds'e ekle; klasör içindeyken ekleme
    orderedIds:
      s.currentFolderId === null
        ? [asset.id, ...s.orderedIds]
        : s.orderedIds,
    recentIds: [asset.id, ...s.recentIds].slice(0, RECENT_LIMIT),
  }));
  return asset;
},
```

---

## Phase 3 — Gallery Asset Picker Modal

### 3.1 `features/gallery/components/GalleryAssetPickerModal.tsx` _(yeni)_

`GalleryFolderPickerModal` ile aynı pattern: React Native `Modal` + local state + direkt service çağrısı.

**Tip tanımı:**

```ts
type GalleryAssetPickerModalProps = {
  visible: boolean;
  title: string;
  onSelect: (asset: AssetEntity) => void;
  onClose: () => void;
};
```

**Local state:**

```ts
const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
const [localPath, setLocalPath]             = useState<MediaFolderEntity[]>([]);
const [subFolders, setSubFolders]           = useState<MediaFolderEntity[]>([]);
const [assets, setAssets]                   = useState<AssetEntity[]>([]);
const [isLoading, setIsLoading]             = useState(false);
```

**`loadContent` fonksiyonu:**

```ts
const loadContent = async (folderId: string | null) => {
  setIsLoading(true);
  try {
    const [folders, assetList] = await Promise.all([
      folderId
        ? MediaFolderService.getChildren(folderId)
        : MediaFolderService.getRootFolders(),
      AssetService.getByFolder(folderId, 100, 0),
    ]);
    setSubFolders(folders);
    setAssets(assetList.filter((a) => a.type === AssetTypes.IMAGE));
    setCurrentFolderId(folderId);
  } finally {
    setIsLoading(false);
  }
};
```

**`useEffect`:** `visible` true olduğunda `setLocalPath([]); loadContent(null);`

**Navigasyon:**

```ts
const navigateInto = async (folder: MediaFolderEntity) => {
  setLocalPath((p) => [...p, folder]);
  await loadContent(folder.id);
};

const navigateUp = async () => {
  const newPath = localPath.slice(0, -1);
  setLocalPath(newPath);
  const parentId = newPath.length > 0 ? newPath[newPath.length - 1].id : null;
  await loadContent(parentId);
};
```

**Layout:**

```
Modal (animationType="slide", fullscreen)
├── Top bar
│     ├── X (onClose)
│     └── title
├── Breadcrumb bar
│     ├── [isAtRoot değilse] Geri butonu → navigateUp()
│     └── Mevcut konum adı (root = t("gallery:folders.allFiles"))
└── [isLoading] ActivityIndicator
    [değilse] ScrollView
      ├── Klasör satırları (FolderOpen + name + ChevronRight)
      │     → tap: navigateInto(folder)
      └── FlatList numColumns=3
            asset item: 80×80, expo-image contentFit="cover", borderRadius: md
            → tap: onSelect(asset); onClose()
    [asset yoksa ve klasör yoksa] empty text
```

**Stil:** Tüm renkler `theme.*`, hiç hardcode yok.

---

## Phase 4 — Vehicle Cover Photo Field Component

### 4.1 `features/vehicle/components/VehicleCoverPhotoField.tsx` _(yeni)_

**Tip tanımı:**

```ts
type VehicleCoverPhotoFieldProps = {
  previewUri: string | null;
  onUploadComplete: (assetId: string, previewUri: string) => void;
};
```

**UI yapısı:**

```
Pressable (onPress → openActionSheet)
  View (aspectRatio: 16/9, borderRadius: lg, overflow: hidden, border: 1px border color)
    ├── [previewUri varsa]
    │     expo-image Image (source={previewUri}, contentFit="cover", flex:1)
    │     View (sağ alt köşe overlay)
    │       Pressable (edit ikonu pill — pencil + "Değiştir" label)
    └── [previewUri yoksa]
          View (flex:1, alignItems: center, justifyContent: center, gap: sm)
            ImagePlus ikonu (size=32, mutedForeground rengi)
            AppText t("coverPhoto.addPhoto") (caption, mutedForeground)
```

**Action sheet:**

```ts
const openActionSheet = () => {
  SheetManager.show("select-sheet", {
    payload: {
      sections: [{
        data: [
          { key: "library",  label: t("coverPhoto.pickFromLibrary") },
          { key: "camera",   label: t("coverPhoto.takePhoto") },
          { key: "gallery",  label: t("coverPhoto.selectFromGallery") },
        ],
      }],
      renderItem: ({ item }: any) => (
        <SelectItem
          label={item.label}
          onPress={() => {
            SheetManager.hide("select-sheet");
            if (item.key === "library")  handleUploadFromSource("library");
            if (item.key === "camera")   handleUploadFromSource("camera");
            if (item.key === "gallery")  setPickerVisible(true);
          }}
        />
      ),
    },
  });
};
```

**Device/Camera upload:**

```ts
const handleUploadFromSource = (source: "library" | "camera") => {
  Alert.alert(
    t("coverPhoto.uploadWarningTitle"),
    t("coverPhoto.uploadWarningMessage"),
    [
      { text: t("coverPhoto.cancel"), style: "cancel" },
      { text: t("coverPhoto.continue"), onPress: () => doUpload(source) },
    ]
  );
};

const doUpload = async (source: "library" | "camera") => {
  const pickerOpts = { allowsEditing: true, aspect: [16, 9] as [number, number], mediaTypes: ["images"] as MediaType[] };
  const uris =
    source === "library"
      ? await pickedImageState.pickImageFromLibrary(pickerOpts)
      : await pickedImageState.pickImageFromCamera(pickerOpts);
  if (!uris?.[0]) return;
  try {
    const asset = await galleryStore.uploadImageToRoot(uris[0]);
    onUploadComplete(asset.id, asset.fullPath);
  } catch (err) {
    handleUIError(err);
  }
};
```

**Gallery picker:**

```tsx
<GalleryAssetPickerModal
  visible={pickerVisible}
  title={t("coverPhoto.pickerTitle")}
  onSelect={(asset) => {
    onUploadComplete(asset.id, asset.fullPath);
    setPickerVisible(false);
  }}
  onClose={() => setPickerVisible(false)}
/>
```

**Hooks:** `usePickedImage({ allowsMultipleSelection: false, maxSelectionLimit: 1 })`, `useGalleryStore()`, `useI18n("vehicle")`.

---

## Phase 5 — Form Integration

### 5.1 `features/vehicle/screens/vehicle-form/vehicle-form.types.ts` _(güncelleme)_

`VehicleFormValues` tipine ekle:

```ts
coverPhotoAssetId: string | null;
coverPhotoPreviewUri: string | null;  // sadece gösterim için, servise gönderilmez
```

`VEHICLE_FORM_EMPTY`'ye ekle:

```ts
coverPhotoAssetId: null,
coverPhotoPreviewUri: null,
```

### 5.2 `features/vehicle/screens/vehicle-form/VehicleFormScreen.tsx` _(güncelleme)_

**Import ekle:**

```ts
import { VehicleCoverPhotoField } from "@/features/vehicle/components/VehicleCoverPhotoField";
import { useRef } from "react";
import { useGalleryStore } from "@/stores/gallery.store";
```

**`VehicleFormScreen` içinde:**

```ts
const previousCoverPhotoAssetIdRef = useRef<string | null>(null);
```

**Vehicle yükleme `useEffect`'ini güncelle:**

```ts
useEffect(() => {
  if (isNew) return;
  VehicleService.getById(id).then((vehicle) => {
    if (vehicle) {
      setInitialValues(vehicleToFormValues(vehicle));
      previousCoverPhotoAssetIdRef.current = vehicle.coverPhotoAssetId ?? null;
    }
    setLoadingVehicle(false);
  });
}, [id]);
```

**`vehicleToFormValues` güncelle:**

```ts
function vehicleToFormValues(v: Vehicle): VehicleFormValues {
  return {
    // ... mevcut alanlar
    coverPhotoAssetId: v.coverPhotoAssetId ?? null,
    coverPhotoPreviewUri: v.coverPhoto?.fullPath ?? null,
  };
}
```

**`formValuesToDto` güncelle:**

```ts
function formValuesToDto(values: VehicleFormValues) {
  return {
    // ... mevcut alanlar
    coverPhotoAssetId: values.coverPhotoAssetId ?? undefined,
  };
}
```

**`handleSubmit` güncelle (update path):**

```ts
await update(id, dto)
  .then(() => {
    const oldId = previousCoverPhotoAssetIdRef.current;
    if (oldId && oldId !== values.coverPhotoAssetId) {
      Alert.alert(
        t("coverPhoto.keepOldTitle"),
        t("coverPhoto.keepOldMessage"),
        [
          { text: t("coverPhoto.keepInGallery") }, // hiçbir şey yapma
          {
            text: t("coverPhoto.removeFromGallery"),
            style: "destructive",
            onPress: () => galleryStore.deleteAsset(oldId).catch(handleUIError),
          },
        ]
      );
    }
    router.back();
  })
  .catch(handleUIError);
```

**`VehicleFormFields` içinde `<ImagePicker>` → `<VehicleCoverPhotoField>`:**

```tsx
<AppFieldGroup label={t("sections.coverPhoto")}>
  <VehicleCoverPhotoField
    previewUri={values.coverPhotoPreviewUri}
    onUploadComplete={(assetId, previewUri) => {
      setFieldValue("coverPhotoAssetId", assetId);
      setFieldValue("coverPhotoPreviewUri", previewUri);
    }}
  />
</AppFieldGroup>
```

> `useGalleryStore` ve `galleryStore.deleteAsset` için `galleryStore`'u `VehicleFormScreen` seviyesinde alıp `VehicleFormFields`'a prop olarak ilet ya da `VehicleFormFields` içinde direkt çağır.

---

## Phase 6 — i18n

### 6.1 `i18n/locales/en/vehicle.json` _(güncelleme)_

Mevcut JSON'a `coverPhoto` anahtarı ekle:

```json
"coverPhoto": {
  "uploadWarningTitle": "Photo will be added to Gallery",
  "uploadWarningMessage": "The photo you take or upload will also be added to the app's gallery.",
  "cancel": "Cancel",
  "continue": "Continue",
  "keepOldTitle": "Previous Cover Photo",
  "keepOldMessage": "Do you want to keep the previous cover photo in the gallery?",
  "keepInGallery": "Keep in Gallery",
  "removeFromGallery": "Remove from Gallery",
  "pickFromLibrary": "Upload from Device",
  "takePhoto": "Take Photo",
  "selectFromGallery": "Select from App Gallery",
  "pickerTitle": "Select Cover Photo",
  "addPhoto": "Add Cover Photo",
  "changePhoto": "Change Photo"
}
```

### 6.2 `i18n/locales/tr/vehicle.json` _(güncelleme)_

```json
"coverPhoto": {
  "uploadWarningTitle": "Fotoğraf Galeriye Eklenecek",
  "uploadWarningMessage": "Çektiğiniz veya yüklediğiniz fotoğraf uygulamanın galerisine de eklenecektir.",
  "cancel": "İptal",
  "continue": "Devam Et",
  "keepOldTitle": "Önceki Kapak Fotoğrafı",
  "keepOldMessage": "Önceki kapak fotoğrafını galeride tutmak ister misiniz?",
  "keepInGallery": "Galeride Kalsın",
  "removeFromGallery": "Galeriden Kaldır",
  "pickFromLibrary": "Cihazdan Yükle",
  "takePhoto": "Kamera ile Çek",
  "selectFromGallery": "Uygulama Galerisinden Seç",
  "pickerTitle": "Kapak Fotoğrafı Seç",
  "addPhoto": "Kapak Fotoğrafı Ekle",
  "changePhoto": "Fotoğrafı Değiştir"
}
```

---

## Kritik Dosya Tablosu

| Dosya | İşlem | Phase |
|---|---|---|
| `features/vehicle/entity/vehicle.entity.ts` | `coverPhotoAssetId` + `coverPhoto` relation ekle | 1 |
| `features/vehicle/service/vehicle.service.ts` | `getById` → `relations: ["coverPhoto"]` | 1 |
| `stores/gallery.store.ts` | `uploadImageToRoot(uri)` action ekle | 2 |
| `features/gallery/components/GalleryAssetPickerModal.tsx` | **Yeni** — asset picker modal | 3 |
| `features/vehicle/components/VehicleCoverPhotoField.tsx` | **Yeni** — cover photo field | 4 |
| `features/vehicle/screens/vehicle-form/vehicle-form.types.ts` | `coverPhotoAssetId`, `coverPhotoPreviewUri` ekle | 5 |
| `features/vehicle/screens/vehicle-form/VehicleFormScreen.tsx` | ImagePicker → yeni component, cleanup logic | 5 |
| `i18n/locales/en/vehicle.json` | `coverPhoto.*` namespace ekle | 6 |
| `i18n/locales/tr/vehicle.json` | `coverPhoto.*` namespace ekle | 6 |

**Toplam:** 2 yeni dosya · 7 güncelleme

---

## Doğrulama Listesi

### TypeScript
- [ ] `npx tsc --noEmit` — sıfır hata

### Yeni araç ekleme
- [ ] Kapak fotoğrafı alanı placeholder (ImagePlus ikonu) gösterir
- [ ] "Cihazdan Yükle" → uyarı alert → "İptal" → hiçbir şey olmaz
- [ ] "Cihazdan Yükle" → uyarı alert → "Devam Et" → library picker → fotoğraf seçilir → preview görünür
- [ ] "Kamera ile Çek" → uyarı alert → "Devam Et" → kamera açılır → çekilir → preview görünür
- [ ] "Uygulama Galerisinden Seç" → uyarısız picker modal açılır → fotoğrafa tap → preview görünür
- [ ] Asset picker modal'da klasörlere girip çıkılabiliyor (breadcrumb çalışıyor)
- [ ] Asset picker modal'da yalnızca image tipi asset'ler görünür
- [ ] Araç kaydedilince `coverPhotoAssetId` DB'ye doğru yazılıyor
- [ ] Yüklenen fotoğraf uygulama galerisine (root) ekleniyor

### Araç güncelleme
- [ ] Edit formuna girilince mevcut cover photo yükleniyor (preview dolu)
- [ ] Cover photo değiştirilmeden kaydetmek → "Eski fotoğraf" alert'i çıkmıyor
- [ ] Yeni fotoğraf seçilip kaydedilince → "Eski fotoğraf galeride kalsın mı?" alert'i çıkıyor
- [ ] "Galeride Kalsın" → router.back(), hiçbir şey silinmiyor
- [ ] "Galeriden Kaldır" → eski asset DB + FS'den siliniyor, router.back()

### Edge case'ler
- [ ] Picker modal'da fotoğraf olmayan klasörde "boş" durumu gösteriliyor
- [ ] Upload başarısız olursa `handleUIError` toast gösteriyor
- [ ] Cover photo olmayan araç düzenlenirken "Eski fotoğraf" alert'i çıkmıyor
