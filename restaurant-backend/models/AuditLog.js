import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    user_email: {
      type: String,
      default: "SYSTEM/GUEST",
    },
    action: {
      type: String,
      required: true, // e.g., "UPDATE_ORDER_STATUS", "RESET_QUEUE", "DELETE_COMPLETED_ORDERS", "EXPORT_TO_SHEETS"
    },
    target_resource: {
      type: String,
      required: true, // e.g., "Order", "Menu", "Queue"
    },
    resource_id: {
      type: String,
      required: false,
      default: null,
    },
    old_values: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    new_values: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    ip_address: {
      type: String,
      default: null,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

export default mongoose.model("AuditLog", auditLogSchema);
