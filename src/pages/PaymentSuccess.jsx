import {
  Link,
  Navigate,
  useLocation,
  useParams,
} from "react-router-dom";

export default function PaymentSuccess() {
  const { orderId } = useParams();
  const location = useLocation();

  const order = location.state?.order;
  const payment = location.state?.payment;

  if (!order || !payment) {
    return (
      <Navigate
        to="/dashboard/orders"
        replace
      />
    );
  }

  const date = new Date(
    payment.paymentDate ||
      order.createdAt ||
      Date.now()
  );

  return (
    <section className="payment-success-page">
      <div className="payment-success-card">
        <div className="success-icon">
          ✓
        </div>

        <span className="success-eyebrow">
          PAYMENT COMPLETE
        </span>

        <h1>Payment Successful! 🎉</h1>

        <p className="success-message">
          Your order has been placed successfully.
          Your payment information has been securely
          recorded.
        </p>

        <div className="payment-receipt">
          <div className="receipt-title">
            <div>
              <span>Payment Receipt</span>
              <strong>ReSell Hub</strong>
            </div>

            <span className="receipt-paid">
              Paid
            </span>
          </div>

          <div className="receipt-product">
            {order.productInfo?.image && (
              <img
                src={order.productInfo.image}
                alt={
                  order.productInfo?.title ||
                  "Product"
                }
              />
            )}

            <div>
              <span>Product</span>

              <strong>
                {order.productInfo?.title ||
                  payment.productName ||
                  "Product"}
              </strong>

              <small>
                Quantity:{" "}
                {order.quantity || 1}
              </small>
            </div>
          </div>

          <div className="receipt-details">
            <div>
              <span>Transaction ID</span>

              <strong>
                {payment.transactionId}
              </strong>
            </div>

            <div>
              <span>Order ID</span>

              <strong>
                #
                {String(
                  order._id || orderId
                ).slice(-8).toUpperCase()}
              </strong>
            </div>

            <div>
              <span>Payment Method</span>

              <strong>Stripe</strong>
            </div>

            <div>
              <span>Payment Date</span>

              <strong>
                {date.toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </strong>
            </div>

            <div>
              <span>Status</span>

              <strong className="receipt-status">
                Paid
              </strong>
            </div>
          </div>

          <div className="receipt-total">
            <span>Payment Amount</span>

            <strong>
              $
              {Number(
                payment.amount ||
                  order.totalAmount ||
                  0
              ).toFixed(2)}
            </strong>
          </div>
        </div>

        <div className="payment-success-actions">
          <Link
            to="/dashboard/orders"
            state={{
              selectedOrderId:
                order._id || orderId,
            }}
            className="success-primary"
          >
            📦 View Order Details
          </Link>

          <Link
            to="/dashboard/orders"
            className="success-secondary"
          >
            My Orders
          </Link>

          <Link
            to="/products"
            className="success-shopping"
          >
            Continue Shopping
          </Link>
        </div>

        <p className="success-footer">
          You can view this transaction anytime
          from Dashboard → Payments.
        </p>
      </div>
    </section>
  );
}