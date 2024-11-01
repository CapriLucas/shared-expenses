import React from "react";
import { Payment } from "../types/payment";
import styles from "../styles/PaymentList.module.css";

interface PaymentListProps {
  payments: Payment[];
  isCreator: boolean;
  onVerify: (paymentId: number) => void;
  isVerifying?: boolean;
}

const PaymentList: React.FC<PaymentListProps> = ({
  payments,
  isCreator,
  onVerify,
  isVerifying = false,
}) => {
  if (!payments.length) {
    return <p className={styles.emptyState}>No payments yet</p>;
  }

  return (
    <div className={styles.paymentList}>
      {payments.map((payment) => (
        <div key={payment.id} className={styles.paymentCard}>
          <div className={styles.paymentInfo}>
            <div>
              <p className={styles.amount}>${payment.amount}</p>
              <p className={styles.date}>
                {new Date(payment.paymentDate).toLocaleDateString()}
              </p>
            </div>
            <div className={styles.status}>
              <span
                className={`${styles.statusBadge} ${
                  payment.isVerified ? styles.verified : styles.pending
                }`}
              >
                {payment.isVerified ? "Verified" : "Pending Verification"}
              </span>
            </div>
          </div>
          <div className={styles.paymentActions}>
            <a
              href={payment.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.viewReceipt}
            >
              View Receipt
            </a>
            {isCreator && !payment.isVerified && (
              <button
                onClick={() => onVerify(payment.id)}
                className={styles.verifyButton}
                disabled={isVerifying}
              >
                {isVerifying ? "Verifying..." : "Verify Payment"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PaymentList;
