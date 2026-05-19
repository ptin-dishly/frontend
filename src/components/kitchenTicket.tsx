import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { type Order } from "../services/api";

interface KitchenTicketProps {
  order: Order;
}

export default function KitchenTicket({ order }: KitchenTicketProps) {
  const { t } = useTranslation();
  const statusKeyMap: Record<Order["status"], "pending" | "inProgress" | "ready" | "completed"> = {
    pending: "pending",
    in_progress: "inProgress",
    ready: "ready",
    completed: "completed",
  };

  return createPortal(
    <div id="kitchen-ticket" style={{ display: "none" }}>
      <style>{`
        @media print {
          body > *:not(#kitchen-ticket) { display: none !important; }
          #kitchen-ticket { display: block !important; }

          #kitchen-ticket {
            font-family: 'Courier New', monospace;
            font-size: 13px;
            width: 280px;
            margin: 0 auto;
            color: #000;
          }

          .ticket-title {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 6px;
          }

          .ticket-divider {
            border-top: 1px dashed #000;
            margin: 6px 0;
          }

          .ticket-row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
          }

          .ticket-table thead tr {
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
          }

          .ticket-table {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0;
          }

          .ticket-table th {
            text-align: left;
            padding: 3px 2px;
            font-weight: bold;
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
          }

          .ticket-table th:last-child,
          .ticket-table td:last-child {
            text-align: right;
          }

          .ticket-table td {
            padding: 3px 2px;
            vertical-align: top;
          }

          .ticket-total {
            text-align: right;
            font-weight: bold;
            border-top: 1px solid #000;
            padding-top: 4px;
            margin-top: 4px;
          }

          .ticket-footer {
            text-align: right;
            font-size: 11px;
            margin-top: 8px;
          }
        }
      `}</style>

      <div className="ticket-title">{t("orders.kitchenTicket.title")}</div>

      <div className="ticket-row">
        <span><strong>{t("orders.kitchenTicket.date")}</strong> {new Date(order.createdAt).toLocaleString()}</span>
      </div>
      <div className="ticket-row">
        <span><strong>{t("orders.kitchenTicket.order")}</strong> {order.orderNumber}</span>
        <span><strong>{t("orders.kitchenTicket.table")}</strong> {order.tableNumber}</span>
      </div>
      <div className="ticket-row">
        <span><strong>{t("orders.kitchenTicket.status")}</strong> {t(`orders.${statusKeyMap[order.status]}`)}</span>
      </div>

      <div className="ticket-divider" />


      <table className="ticket-table">
        <thead>
          <tr>
            <th>{t("orders.kitchenTicket.columnIndex")}</th>
            <th>{t("orders.kitchenTicket.columnProduct")}</th>
            <th>{t("orders.kitchenTicket.columnQty")}</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{item.name.toUpperCase()}</td>
              <td>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ticket-total">
        {t("orders.kitchenTicket.totalItems", { count: order.items.reduce((sum, i) => sum + i.quantity, 0) })}
      </div>

      <div className="ticket-footer">
        {t("orders.kitchenTicket.printed")} {new Date().toLocaleTimeString()}
      </div>
    </div>
    , document.body);
}