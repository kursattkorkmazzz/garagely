import { BaseEntity } from "@/db/entity/base.entity";
import { Column, Entity, Index, Unique } from "typeorm";

@Entity("tags")
@Index(["scope"])
@Unique("UQ_tag_name_per_scope", ["name", "scope"])
export class Tag extends BaseEntity {
  @Column({ type: "text" })
  name!: string;

  @Column({ type: "text" })
  scope!: string;
}
