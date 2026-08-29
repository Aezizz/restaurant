import Counter from "../models/Counter.js";

export const getNextQueueNumber = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "order_queue" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  return counter.seq;
};

export const resetQueueApi = async () => {
  await Counter.findOneAndUpdate(
    { name: "order_queue" },
    { $set: { seq: 0 } },
    { upsert: true },
  );
};
