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
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "parentId" })
  parent?: MediaFolderEntity | null;

  @OneToMany("MediaFolderEntity", (f: MediaFolderEntity) => f.parent)
  children?: MediaFolderEntity[];

  @OneToMany("AssetEntity", (a: AssetEntity) => a.folder)
  assets?: AssetEntity[];
}
