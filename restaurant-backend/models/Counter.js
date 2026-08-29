// models/Counter.js
import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  name: { type: String, default: "order_queue" },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", counterSchema);
export default Counter;
