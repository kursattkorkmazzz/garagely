import { Column } from "typeorm";

export class Money {
  @Column({ type: "integer", nullable: true })
  amount!: number | null;

  @Column({ type: "text", nullable: true })
  currency!: string | null;
}
