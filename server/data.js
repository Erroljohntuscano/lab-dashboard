export const FEE = 300; 

const PER_DAY = { Mon: 120, Tue: 180, Wed: 240, Thu: 300, Fri: 408 };
const PAID = 1102;
const PENDING = 96; 
const CHECKED_IN = 936;

const days = Object.entries(PER_DAY).flatMap(([day, n]) => Array(n).fill(day));
const TOTAL = days.length; 

export const registrations = days.map((day, i) => {
  const p = (i * 7919) % TOTAL;
  const c = (i * 104729) % TOTAL;
  return {
    id: i + 1,
    day,
    paymentStatus: p < PAID ? "paid" : p < PAID + PENDING ? "pending" : "waived",
    checkedIn: c < CHECKED_IN,
  };
});