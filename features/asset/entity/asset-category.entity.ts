/**
 * @deprecated — MediaFolderEntity ile değiştirildi.
 * Bu dosya Phase 4 (gallery store güncellemesi) sonrasında silinecek.
 */
import { BaseEntity } from "@/db/entity/base.entity";
import { Column, Entity } from "typeorm";

@Entity("asset_categories")
export class AssetCategoryEntity extends BaseEntity {
  @Column({ type: "text" })
  name!: string;

  @Column({ type: "text", nullable: true })
  icon?: string;

  @Column({ type: "integer", default: 0 })
  sortOrder!: number;
}
