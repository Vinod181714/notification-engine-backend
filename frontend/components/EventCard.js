import Link from 'next/link';
export default function EventCard({ event }){
  return (
    <div style={{border:'1px solid #ddd', padding:12, marginBottom:12}}>
      <h3>{event.title || event.event_type}</h3>
      <p>{event.message}</p>
      <div>Classification: {event.classification}</div>
      <Link href={`/events/${event._id}`}>View</Link>
    </div>
  );
}
