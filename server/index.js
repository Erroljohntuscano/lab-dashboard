import express from "express";
import cors from "cors";
import { registrations, FEE } from "./data.js";

const app = express();
app.use(cors());

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function summarize(records) {
  const total = records.length;
  const checkedIn = records.filter((r) => r.checkedIn).length;
  const paid = records.filter((r) => r.paymentStatus === "paid").length;
  const pending = records.filter((r) => r.paymentStatus === "pending").length;
  const waived = records.filter((r) => r.paymentStatus === "waived").length;

  return {
    range: { label: "Mon–Fri (event week)", from: "Mon", to: "Fri" },
    updatedAt: new Date().toISOString(),
    kpis: {
      totalRegistrations: total,
      checkedIn,
      checkInRate: total ? Math.round((checkedIn / total) * 1000) / 10 : 0,
      paid,
      pending,
      waived,
      feePerPaid: FEE,
      revenue: paid * FEE,
      currency: "PHP",
    },
    registrationsByDay: DAYS.map((day) => ({
      day,
      count: records.filter((r) => r.day === day).length,
    })),
  };
}

app.get("/api/reports/summary", (req, res) => {
  const { simulate } = req.query;
  if (simulate === "error") {
    return res.status(500).json({ error: "Simulated server failure" });
  }
  const records = simulate === "empty" ? [] : registrations;
  const send = () => res.json(summarize(records));
  if (simulate === "slow") return setTimeout(send, 2500);
  send();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));