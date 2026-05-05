import type { IconName } from "@/components/ui/icon";
import { StationType, StationTypes } from "@/features/station/types/station-type";

export type StationColorToken =
  | "orange"
  | "red"
  | "cyan"
  | "green"
  | "purple"
  | "rose";

export interface StationTypeMeta {
  icon: IconName;
  color: StationColorToken;
}

export const STATION_TYPE_META: Record<StationType, StationTypeMeta> = {
  [StationTypes.GAS_STATION]: { icon: "Fuel", color: "orange" },
  [StationTypes.MECHANIC]: { icon: "Wrench", color: "red" },
  [StationTypes.CAR_WASH]: { icon: "Droplets", color: "cyan" },
  [StationTypes.INSPECTION]: { icon: "ClipboardCheck", color: "green" },
  [StationTypes.AUTHORIZED_SERVICE]: { icon: "BadgeCheck", color: "purple" },
  [StationTypes.PARKING]: { icon: "CircleParking", color: "rose" },
};
