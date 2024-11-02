import React, { useState } from "react";
import { QuickSplitPerson, QuickSplitPayment } from "../types/quickSplit";
import styles from "../styles/QuickSplitPaymentForm.module.css";

interface QuickSplitPaymentFormProps {
  people: QuickSplitPerson[];
  onSubmit: (payment: Omit<QuickSplitPayment, "id">) => void;
}

const QuickSplitPaymentForm: React.FC<QuickSplitPaymentFormProps> = ({
  people,
  onSubmit,
}) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [payer, setPayer] = useState<QuickSplitPerson | null>(null);
  const [splitWith, setSplitWith] = useState<QuickSplitPerson[]>([]);
  const [includePayerInSplit, setIncludePayerInSplit] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payer || !amount || !description) return;

    const finalSplitWith = includePayerInSplit
      ? [...splitWith, payer]
      : splitWith;

    onSubmit({
      description,
      amount: parseFloat(amount),
      payer,
      splitWith: finalSplitWith,
    });

    // Reset form
    setDescription("");
    setAmount("");
    setPayer(null);
    setSplitWith([]);
  };

  const togglePerson = (person: QuickSplitPerson) => {
    if (splitWith.find((p) => p.id === person.id)) {
      setSplitWith(splitWith.filter((p) => p.id !== person.id));
    } else {
      setSplitWith([...splitWith, person]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="description">Description</label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Dinner"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="amount">Amount</label>
        <input
          id="amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>Paid by</label>
        <div className={styles.peopleList}>
          {people.map((person) => (
            <button
              key={person.id}
              type="button"
              className={`${styles.personButton} ${
                payer?.id === person.id ? styles.selected : ""
              }`}
              onClick={() => setPayer(person)}
            >
              {person.name}
            </button>
          ))}
        </div>
      </div>

      {payer && (
        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={includePayerInSplit}
              onChange={(e) => setIncludePayerInSplit(e.target.checked)}
            />
            Include {payer.name} in split
          </label>
        </div>
      )}

      <div className={styles.formGroup}>
        <label>Split with</label>
        <div className={styles.peopleList}>
          {people
            .filter((person) => person.id !== payer?.id)
            .map((person) => (
              <button
                key={person.id}
                type="button"
                className={`${styles.personButton} ${
                  splitWith.find((p) => p.id === person.id)
                    ? styles.selected
                    : ""
                }`}
                onClick={() => togglePerson(person)}
              >
                {person.name}
              </button>
            ))}
        </div>
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={!payer || !amount || !description || splitWith.length === 0}
      >
        Add Payment
      </button>
    </form>
  );
};

export default QuickSplitPaymentForm;
