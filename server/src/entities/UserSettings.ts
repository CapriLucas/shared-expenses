import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class UserSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column("jsonb", {
    default: {
      newExpenses: true,
      payments: true,
      dueDates: true,
    },
  })
  notifications: {
    newExpenses: boolean;
    payments: boolean;
    dueDates: boolean;
  };

  @Column({ default: "USD" })
  currency: string;

  @Column({ default: "MM/DD/YYYY" })
  dateFormat: string;

  @Column({ default: "en" })
  language: string;

  @Column("jsonb", {
    default: {
      theme: "light",
      compactView: false,
    },
  })
  display: {
    theme: "light" | "dark";
    compactView: boolean;
  };
}
