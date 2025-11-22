import { notFound } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

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

  return (
    <section id="event">
      <h1>Event Details:<br/>{slug}</h1>
    </section>
  );
};

export default EventDetailsPage;