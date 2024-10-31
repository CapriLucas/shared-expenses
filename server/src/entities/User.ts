import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Expense } from "./Expense";
import { Payment } from "./Payment";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column()
  googleId: string;

  @Column()
  avatarUrl: string;

  @OneToMany(() => Expense, (expense) => expense.creator)
  createdExpenses: Expense[];

  @OneToMany(() => Expense, (expense) => expense.payer)
  payableExpenses: Expense[];

  @OneToMany(() => Payment, (payment) => payment.payer)
  payments: Payment[];
}
