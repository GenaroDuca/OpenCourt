const DURATION_MINUTES = 90;
const targetDateStr = '2026-04-30'; // Tomorrow
const targetStartTime = '17:00';

let defaultEndStr = '09:30';
const [h, m] = targetStartTime.split(':').map(Number);
let defaultEnd = new Date(); // TODAY
defaultEnd.setHours(h, m + DURATION_MINUTES); // Today at 18:30

const proposedStart = new Date(`${targetDateStr}T${targetStartTime}`);
const bookings = [{court_id: 1, start_time: '2026-04-30T18:00:00', end_time: '2026-04-30T22:00:00'}];
const initialCourtId = 1;

const nextBooking = bookings
  .filter((b) => b.court_id === initialCourtId && new Date(b.start_time) >= proposedStart)
  .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))[0];

if (nextBooking) {
  const nextBookingStart = new Date(nextBooking.start_time); // Tomorrow at 18:00
  if (defaultEnd > nextBookingStart) { // Today at 18:30 > Tomorrow at 18:00 -> FALSE!
    defaultEnd = nextBookingStart;
  }
}

console.log('defaultEnd capped to:', defaultEnd.toString());
console.log('original proposedStart:', proposedStart.toString());
console.log('bStart < proposedEnd check:');

// isCourtOccupied simulation uses defaultEnd in `endTime` string
const endTimeStr = defaultEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
const proposedEndStr = new Date(`${targetDateStr}T${endTimeStr}`); // Tomorrow at 18:30

const isOccupied = bookings.some((b) => {
  const bStart = new Date(b.start_time);
  const bEnd = new Date(b.end_time);
  return bStart < proposedEndStr && bEnd > proposedStart;
});
console.log('Is occupied?', isOccupied);
