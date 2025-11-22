import Image from "next/image";
import { notFound } from "next/navigation";
import { cleanedArray } from "@/lib/utils";
import BookEvents from "@/components/BookEvents";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

const EventDetailItem = ({
  icon,
  alt,
  label,
}: {
  icon: string
  alt: string
  label: string
}) => (
  <div className="flex-row-gap-2 items-center">
    <Image
      src={icon}
      alt={alt}
      width={17}
      height={17}
    />
    <p>{label}</p>
  </div>
);

const EventAgenda = ({
  agendaItems,
}: {
  agendaItems: string[]
}) => (
  <div className="agenda">
    <h2>Agenda</h2>
    <ul>
      {
        agendaItems.map(item => (
          <li key={item}>- {item}</li>
        ))
      }
    </ul>
  </div>
);

const EventTags = ({
  tags,
}: {
  tags: string[]
}) => (
  <div className="flex flex-row gap-1.5 flex-wrap">
    {
      tags.map(tag => (
        <div className="pill" key={tag}>{tag}</div>
      ))
    }
  </div>
);

const EventDetailsPage = async ({
  params
}: {
  params: Promise<{
    slug: string
  }>
}) => {
  const { slug } = await params;
  const request = await fetch(`${BASE_URL}/api/events/${slug}`);

  if (!request.ok) return notFound();

  const { event } = await request.json();

  if (!event) return notFound();

  const {
    description,
    image,
    overview,
    date,
    time,
    location,
    mode,
    audience,
    agenda,
    tags,
    organizer,
  } = event;

  const cleanedAgenda = cleanedArray(agenda[0]);
  const cleanedTags = cleanedArray(tags[0]);
  const bookings = 10;

  return (
    <section id="event">
      {/* Event Description */}
      <div className="header">
        <h1>Event Description</h1>
        <p>{description}</p>
      </div>

      <div className="details">
        {/* Left Side - Event Content */}
        <div className="content">
          <Image
            src={image}
            alt="Event Banner"
            width={800}
            height={800}
            className="banner"
          />

          {/* Overview */}
          <section className="flex-col-gap-2">
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>

          {/* Event Detail */}
          <section className="flex-col-gap-2">
            <h2>Details</h2>
            
            {/* Date */}
            <EventDetailItem
              icon="/icons/calendar.svg"
              alt="calendar"
              label={date}
            />
            
            {/* Time */}
            <EventDetailItem
              icon="/icons/clock.svg"
              alt="clock"
              label={time}
            />
            
            {/* Location */}
            <EventDetailItem
              icon="/icons/pin.svg"
              alt="pin"
              label={location}
            />
            
            {/* Mode */}
            <EventDetailItem
              icon="/icons/mode.svg"
              alt="mode"
              label={mode}
            />
            
            {/* Audience */}
            <EventDetailItem
              icon="/icons/audience.svg"
              alt="audience"
              label={audience}
            />
          </section>

          {/* Agenda */}
          <EventAgenda agendaItems={cleanedAgenda} />

          {/* Organizer */}
          <section className="flex-col-gap-2">
            <h2>About the Organizer</h2>
            <p>{organizer}</p>
          </section>

          {/* Tags */}
          <EventTags tags={cleanedTags} />

        </div>

        {/* Right Side - Booking Form */}
        <aside className="booking">
          <div className="signup-card">
            <h2>Book Your Spot</h2>
            <p className="text-sm">
              {
                bookings > 0
                ?
                `Join ${bookings} people who have already booked their spot!`
                :
                `Be the first to book your spot!`
              }
            </p>
            <BookEvents />
          </div>
        </aside>
      </div>
    </section>
  );
};

export default EventDetailsPage;