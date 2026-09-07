"use client";

import TicketForm, { TicketFormValues } from "@/components/tickets/TicketForm";
import api from "@/lib/axios";
import { TicketType } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NEXT_STEPS = [
  {
    title: "Submitted",
    description: "You'll get a reference number immediately.",
  },
  {
    title: "Reviewed",
    description: "An IT officer triggers it and sets a priority.",
  },
  {
    title: "In progress",
    description: "You'll see who's assigned and can add notes.",
  },
  {
    title: "Resolved",
    description: "You'll get a reference number immediately.",
  },
];

const SubmitTicketClient = ({
  initialTickets,
}: {
  initialTickets: TicketType[] | null;
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const holeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [positions, setPositions] = useState<number[]>([]);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const timeline = timelineRef.current;

    if (!timeline) return;

    const updatePositions = () => {
      const timelineTop = timeline.getBoundingClientRect().top;

      const newPositions = holeRefs.current.map((hole) => {
        if (!hole) return 0;

        return hole.getBoundingClientRect().top - timelineTop;
      });

      setPositions(newPositions);
    };

    updatePositions();

    const resizeObserver = new ResizeObserver(() => {
      updatePositions();
    });

    resizeObserver.observe(timeline);

    holeRefs.current.forEach((hole) => {
      if (hole) {
        resizeObserver.observe(hole.parentElement!);
      }
    });

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const animationStyle =
    positions.length === NEXT_STEPS.length
      ? ({
          "--timeline-1": `${positions[0]}px`,
          "--timeline-2": `${positions[1]}px`,
          "--timeline-3": `${positions[2]}px`,
          "--timeline-4": `${positions[3]}px`,
        } as React.CSSProperties)
      : undefined;

  const handleSubmit = async (values: TicketFormValues): Promise<void> => {
    let pictureUrl: string[] = [];

    if (values.file) {
      const fileExt = values.file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("ticket-attachments")
        .upload(fileName, values.file);

      if (uploadError) {
        throw new Error(`Upload Failed: ${uploadError.message}`);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("ticket-attachments").getPublicUrl(fileName);

      pictureUrl.push(publicUrl);
    }

    const ticketPayload = {
      title: values.title,
      category: values.category,
      department: values.department,
      priority: values.priority,
      related_asset: values.relatedAsset,
      description: values.description,
      picture: pictureUrl,
    };

    await api.post("/tickets", ticketPayload);
    router.refresh();
    router.push("/staff/tickets");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-heading">Report an issue</h1>
        <p className="mt-1 text-sm text-body">
          The IT unit reviews new tickets within one business day
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-6 lg:col-span-2">
          <TicketForm
            relatedTickets={initialTickets}
            showFileUpload
            beforeActions={
              <div className="flex items-center justify-between border-t border-dashed border-line pt-4">
                <p className="font-mono text-xs uppercase tracking-widest text-muted">
                  Keep this reference for your records
                </p>
                <span className="rounded-md bg-input-bg px-2.5 py-1 font-mono text-xs text-muted">
                  DRAFT
                </span>
              </div>
            }
            submitLabel="Submit ticket"
            submittingLabel="Submitting..."
            onSubmit={handleSubmit}
            onCancel={() => router.push("/staff/tickets")}
          />
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 h-fit">
          <h3 className="font-serif text-xl text-heading">What happens next</h3>
          <div
            ref={timelineRef}
            style={animationStyle}
            className="relative mt-4"
          >
            {positions.length === NEXT_STEPS.length && (
              <span className="animate-timeline-ball absolute left-0 z-10 h-3 w-3 rounded-full bg-button" />
            )}

            {NEXT_STEPS.map((step, index) => (
              <div key={step.title} className="relative pb-6 pl-6 last:pb-0">
                {index !== NEXT_STEPS.length - 1 && (
                  <span className="absolute left-1.25 top-3 h-full w-px bg-line" />
                )}
                <span
                  ref={(element) => {
                    holeRefs.current[index] = element;
                  }}
                  className="absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-line bg-white"
                />
                <h4 className="text-sm font-semibold text-heading">
                  {step.title}
                </h4>
                <p className="mt-0.5 text-xs text-body">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitTicketClient;
