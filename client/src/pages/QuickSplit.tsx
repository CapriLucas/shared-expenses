import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  QuickSplitPerson,
  QuickSplitPayment,
  Settlement,
} from "../types/quickSplit";
import styles from "../styles/QuickSplit.module.css";
import QuickSplitPaymentForm from "../components/QuickSplitPaymentForm";

// Helper function to round to 2 decimal places
const roundToTwo = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

const QuickSplit: React.FC = () => {
  const [people, setPeople] = useState<QuickSplitPerson[]>([]);
  const [payments, setPayments] = useState<QuickSplitPayment[]>([]);
  const [newPersonName, setNewPersonName] = useState("");
  const [settlements, setSettlements] = useState<Settlement[]>([]);

  const addPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;

    const newPerson: QuickSplitPerson = {
      id: uuidv4(),
      name: newPersonName.trim(),
    };

    setPeople([...people, newPerson]);
    setNewPersonName("");
  };

  const addPayment = (payment: Omit<QuickSplitPayment, "id">) => {
    const newPayment: QuickSplitPayment = {
      ...payment,
      id: uuidv4(),
    };
    setPayments([...payments, newPayment]);
    setSettlements([]);
  };

  const calculateSettlements = () => {
    // Create a balance sheet for each person
    const balances = new Map<string, number>();
    people.forEach((person) => balances.set(person.id, 0));

    // Calculate what each person has paid and owes
    payments.forEach((payment) => {
      const perPersonAmount = roundToTwo(
        payment.amount / payment.splitWith.length
      );
      const totalSplitAmount = roundToTwo(
        perPersonAmount * payment.splitWith.length
      );

      // Add the full amount to payer's balance
      balances.set(
        payment.payer.id,
        roundToTwo((balances.get(payment.payer.id) || 0) + payment.amount)
      );

      // Subtract the split amount from each person's balance
      payment.splitWith.forEach((person) => {
        balances.set(
          person.id,
          roundToTwo((balances.get(person.id) || 0) - perPersonAmount)
        );
      });

      // Handle rounding errors by adjusting payer's balance
      const roundingError = payment.amount - totalSplitAmount;
      if (roundingError !== 0) {
        balances.set(
          payment.payer.id,
          roundToTwo((balances.get(payment.payer.id) || 0) - roundingError)
        );
      }
    });
    console.log("balances after payments", balances);

    // Convert balances to settlements
    const newSettlements: Settlement[] = [];
    const debtors = people
      .filter((p) => roundToTwo(balances.get(p.id) || 0) < 0)
      .sort((a, b) => (balances.get(a.id) || 0) - (balances.get(b.id) || 0));
    const creditors = people
      .filter((p) => roundToTwo(balances.get(p.id) || 0) > 0)
      .sort((a, b) => (balances.get(b.id) || 0) - (balances.get(a.id) || 0));

    let debtorIdx = 0;
    let creditorIdx = 0;

    while (debtorIdx < debtors.length && creditorIdx < creditors.length) {
      const debtor = debtors[debtorIdx];
      const creditor = creditors[creditorIdx];

      const debtorBalance = Math.abs(roundToTwo(balances.get(debtor.id) || 0));
      const creditorBalance = roundToTwo(balances.get(creditor.id) || 0);

      const amount = roundToTwo(Math.min(debtorBalance, creditorBalance));

      if (amount > 0) {
        newSettlements.push({
          from: debtor,
          to: creditor,
          amount: amount,
        });
      }

      if (debtorBalance > creditorBalance) {
        balances.set(debtor.id, roundToTwo(-(debtorBalance - creditorBalance)));
        balances.set(creditor.id, 0);
        creditorIdx++;
      } else {
        balances.set(debtor.id, 0);
        balances.set(creditor.id, roundToTwo(creditorBalance - debtorBalance));
        debtorIdx++;
      }
    }

    setSettlements(newSettlements);
  };

  return (
    <div className={styles.container}>
      <h1>Quick Split</h1>

      {/* Add People Form */}
      <section className={styles.section}>
        <h2>People</h2>
        <form onSubmit={addPerson} className={styles.addPersonForm}>
          <input
            type="text"
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            placeholder="Enter name"
          />
          <button type="submit">Add Person</button>
        </form>
        <div className={styles.peopleList}>
          {people.map((person) => (
            <div key={person.id} className={styles.personTag}>
              {person.name}
            </div>
          ))}
        </div>
      </section>

      {/* Add Payment Form */}
      {people.length >= 2 && (
        <section className={styles.section}>
          <h2>Add Payment</h2>
          <QuickSplitPaymentForm people={people} onSubmit={addPayment} />
        </section>
      )}

      {/* Payments List */}
      {payments.length > 0 && (
        <section className={styles.section}>
          <h2>Payments</h2>
          <div className={styles.paymentsList}>
            {payments.map((payment) => (
              <div key={payment.id} className={styles.paymentCard}>
                <div className={styles.paymentHeader}>
                  <h3>{payment.description}</h3>
                  <span className={styles.amount}>${payment.amount}</span>
                </div>
                <p>Paid by: {payment.payer.name}</p>
                <p>
                  Split with: {payment.splitWith.map((p) => p.name).join(", ")}
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={calculateSettlements}
            className={styles.calculateButton}
          >
            Calculate Settlements
          </button>
        </section>
      )}

      {/* Settlements */}
      {settlements.length > 0 && (
        <section className={styles.section}>
          <h2>Settlements</h2>
          <div className={styles.settlementsList}>
            {settlements.map((settlement, index) => (
              <div key={index} className={styles.settlementCard}>
                <p>
                  <strong>{settlement.from.name}</strong> pays{" "}
                  <strong>${settlement.amount}</strong> to{" "}
                  <strong>{settlement.to.name}</strong>
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default QuickSplit;
