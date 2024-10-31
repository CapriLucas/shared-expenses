import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Payment } from "./Payment";

export enum RecurrenceType {
  NONE = "none",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

@Entity()
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column("decimal", { precision: 10, scale: 2 })
  amount: number;

  @Column("timestamp with time zone")
  dueDate: Date;

  @Column({
    type: "varchar",
    default: RecurrenceType.NONE,
  })
  recurrenceType: RecurrenceType;

  @Column({
    type: "timestamp with time zone",
    nullable: true,
  })
  recurrenceEndDate: Date | null;

  @ManyToOne(() => User, (user) => user.createdExpenses)
  creator: User;

  @ManyToOne(() => User, (user) => user.payableExpenses)
  payer: User;

  @OneToMany(() => Payment, (payment) => payment.expense)
  payments: Payment[];

  @Column({ default: false })
  isPaid: boolean;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt: Date;
}
