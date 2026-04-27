import { BaseEntity } from "@/db/entity/base.entity";
import type { AssetCategoryEntity } from "@/features/asset/entity/asset-category.entity";
import type { ImageMetadataEntity } from "@/features/asset/entity/metadata/image-metadata.entity";
import { MimeType } from "@/features/asset/types/mime-type.type";
import { Column, Entity, Index, JoinTable, ManyToMany, OneToOne } from "typeorm";

@Entity("assets")
@Index(["createdAt"]) // Galeri listesi için
export class AssetEntity extends BaseEntity {
  @Column({
    type: "varchar",
    length: 20,
    comment:
      "Type of the asset, e.g. 'IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO', 'GENERIC'",
  })
  type!: string;

  @Column({
    type: "varchar",
    length: 100,
    comment: "MIME type of the asset, e.g. 'image/jpeg', 'application/pdf'",
  })
  mimeType!: MimeType;

  @Column({
    type: "varchar",
    length: 255,
    comment:
      "Base name of the file without extension, e.g. 'photo' for 'photo.jpg'",
  })
  baseName!: string;

  @Column({
    type: "varchar",
    length: 255,
    comment: "Original file name with extension",
  })
  fullName!: string;

  @Column({
    type: "varchar",
    length: 500,
    comment: "File extension without dot, e.g. 'jpg', 'png'",
  })
  extension!: string;

  @Column({
    type: "varchar",
    length: 500,
    comment: "Base path of the asset in storage without name and extension",
  })
  basePath!: string;

  @Column({
    type: "varchar",
    length: 500,
    nullable: true,
    comment: "Full path of the asset",
  })
  fullPath!: string;

  @Column({ type: "integer", default: 0 })
  sizeBytes!: number;

  @OneToOne("ImageMetadataEntity", (m: ImageMetadataEntity) => m.asset, {
    lazy: true,
    nullable: true,
    cascade: ["insert", "update", "remove"],
    onDelete: "CASCADE",
  })
  imageMetadata?: Promise<ImageMetadataEntity | null>;

  @ManyToMany("AssetCategoryEntity", (cat: AssetCategoryEntity) => cat.assets, {
    nullable: true,
  })
  @JoinTable({
    name: "asset_category_map",
    joinColumn: { name: "assetId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "categoryId", referencedColumnName: "id" },
  })
  categories?: AssetCategoryEntity[];
}
