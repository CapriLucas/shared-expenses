import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";

export enum NotificationType {
  NEW_EXPENSE = "new_expense",
  PAYMENT_RECEIVED = "payment_received",
  PAYMENT_VERIFIED = "payment_verified",
  EXPENSE_DUE = "expense_due",
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @Column({
    type: "enum",
    enum: NotificationType,
  })
  type: NotificationType;

  @Column()
  message: string;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
