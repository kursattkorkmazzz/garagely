import { BaseEntity } from "@/db/entity/base.entity";
import type { AssetEntity } from "@/features/asset/entity/asset.entity";
import { Column, Entity, ManyToMany } from "typeorm";

@Entity("asset_categories")
export class AssetCategoryEntity extends BaseEntity {
  @Column({ type: "text" })
  name!: string;

  @Column({ type: "text", nullable: true })
  icon?: string;

  @Column({ type: "integer", default: 0 })
  sortOrder!: number;

  @ManyToMany("AssetEntity", (asset: AssetEntity) => asset.categories)
  assets?: AssetEntity[];
}
