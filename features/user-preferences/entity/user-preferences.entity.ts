import { BaseEntity } from "@/db/entity/base.entity";
import { CurrencyTypes, type CurrencyType } from "@/shared/currency";
import { DistanceTypes, type DistanceType } from "@/shared/distance";
import { Languages, type Language } from "@/shared/languages";
import { AppThemeTypes, type AppThemeType } from "@/shared/theme";
import { VolumeTypes, type VolumeType } from "@/shared/volume";
import { Column, Entity } from "typeorm";

@Entity("user_preferences")
export class UserPreferences extends BaseEntity {
  @Column({ type: "text", default: AppThemeTypes.SYSTEM })
  theme!: AppThemeType;

  @Column({ type: "text", default: Languages.EN })
  language!: Language;

  @Column({ type: "text", default: DistanceTypes.KM })
  distanceUnit!: DistanceType;

  @Column({ type: "text", default: CurrencyTypes.TRY })
  currency!: CurrencyType;

  @Column({ type: "text", default: VolumeTypes.L })
  volumeUnit!: VolumeType;
}
