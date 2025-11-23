'use client';

import { createBooking } from "@/lib/actions/booking.actions";
import posthog from "posthog-js";
import { FormEvent, useState } from "react"

const BookEvents = ({
  eventId,
  slug,
}: {
  eventId: string;
  slug: string;
}) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const { success } = await createBooking({
      eventId,
      slug,
      email,
    });

    if (success) {
      setSubmitted(true);
      posthog.capture('event_booked', {
        eventId,
        slug,
      });
    } else {
      console.error('Booking creation failed');
      posthog.captureException('Booking creation failed');
    };
  };

  return (
    <div id="book-event">
      {
        submitted
        ?
        ( <p className="text-sm">Thank you for signing up!</p> )
        :
        (
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                name="email"
                placeholder="Enter your email address"
                aria-label="Email address for event booking"
                required
              />
            </div>
            <button
              type="submit"
              className="button-submit"
            >
              Submit
            </button>
          </form>
        )
      }
    </div>
  )
}

export default BookEvents