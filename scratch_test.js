const DURATION_MINUTES = 90;
const targetDateStr = '2026-04-29';
const targetStartTime = '17:00';

let defaultEndStr = '09:30';
const [h, m] = targetStartTime.split(':').map(Number);
let defaultEnd = new Date();
defaultEnd.setHours(h, m + DURATION_MINUTES);

const proposedStart = new Date(`${targetDateStr}T${targetStartTime}`);
const bookings = [{court_id: 1, start_time: '2026-04-29T18:00:00', end_time: '2026-04-29T22:00:00'}];
const initialCourtId = 1;

const nextBooking = bookings
  .filter((b) => b.court_id === initialCourtId && new Date(b.start_time) >= proposedStart)
  .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))[0];

if (nextBooking) {
  const nextBookingStart = new Date(nextBooking.start_time);
  if (defaultEnd > nextBookingStart) {
    defaultEnd = nextBookingStart;
  }
}

console.log('defaultEnd capped to:', defaultEnd.toString());
console.log('original proposedStart:', proposedStart.toString());
console.log('bStart < proposedEnd check:');

const isOccupied = bookings.some((b) => {
  const bStart = new Date(b.start_time);
  const bEnd = new Date(b.end_time);
  return bStart < defaultEnd && bEnd > proposedStart;
});
console.log('Is occupied?', isOccupied);
