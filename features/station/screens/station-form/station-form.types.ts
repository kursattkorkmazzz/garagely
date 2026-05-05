import { MediaItem } from "@/components/media-gallery-field/AppMediaGalleryField";
import { StationType } from "@/features/station/types/station-type";

export type StationFormValues = {
  name: string;
  type: StationType | "";
  brand: string;
  address: string;
  city: string;
  latitude: string;
  longitude: string;
  phone: string;
  website: string;
  notes: string;
  rating: number | null;
  isFavorite: boolean;
  // media
  media: MediaItem[];
  coverAssetId: string | null;
  // tags
  existingTagIds: string[];
  newTagNames: string[];
};

export const STATION_FORM_EMPTY: StationFormValues = {
  name: "",
  type: "",
  brand: "",
  address: "",
  city: "",
  latitude: "",
  longitude: "",
  phone: "",
  website: "",
  notes: "",
  rating: null,
  isFavorite: false,
  media: [],
  coverAssetId: null,
  existingTagIds: [],
  newTagNames: [],
};
