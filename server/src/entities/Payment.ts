import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";
import { Expense } from "./Expense";

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Expense, (expense) => expense.payments)
  expense: Expense;

  @ManyToOne(() => User, (user) => user.payments)
  payer: User;

  @Column("decimal", { precision: 10, scale: 2 })
  amount: number;

  @Column()
  receiptUrl: string;

  @Column()
  paymentDate: Date;

  @Column({ default: false })
  isVerified: boolean;

  @Column()
  createdAt: Date;
}
