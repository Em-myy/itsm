"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface ActivityType {
  id: string;
  action: React.ReactNode;
  time: string;
}

const RealTimeActivityLog = ({
  activities,
  emptyFallback,
}: {
  activities: ActivityType | ActivityType[] | null;
  emptyFallback: React.ReactNode;
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const holeRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const [positions, setPositions] = useState<number[]>([]);

  const supabase = createClient();
  const router = useRouter();

  const activitiesArray: ActivityType[] = Array.isArray(activities)
    ? activities
    : activities
      ? [activities]
      : [];

  const activityKey = activitiesArray.map((activity) => activity?.id).join("|");

  useEffect(() => {
    const channel = supabase
      .channel("realtime_activity_logs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activity_logs" },
        () => {
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  useEffect(() => {
    if (!activitiesArray.length) {
      setPositions([]);
      return;
    }

    const timeline = timelineRef.current;

    if (!timeline) return;

    const updatePositions = () => {
      const timelineRect = timeline.getBoundingClientRect();

      const newPositions = holeRefs.current
        .slice(0, activitiesArray.length)
        .map((hole) => {
          if (!hole) return null;

          const holeRect = hole.getBoundingClientRect();

          return holeRect.top - timelineRect.top + holeRect.height / 2 - 6;
        })
        .filter((position): position is number => position !== null);

      setPositions(newPositions);
    };

    requestAnimationFrame(updatePositions);

    const resizeObserver = new ResizeObserver(updatePositions);

    resizeObserver.observe(timeline);

    holeRefs.current.forEach((hole) => {
      if (hole) {
        resizeObserver.observe(hole);
      }
    });

    return () => {
      resizeObserver.disconnect();
    };
  }, [activityKey, activitiesArray.length]);

  if (!activities || (Array.isArray(activities) && activities.length === 0)) {
    return <>{emptyFallback}</>;
  }

  const generateKeyFrames = () => {
    if (positions.length === 0) {
      return "";
    }

    if (positions.length === 1) {
      return `
         0%,
        100% {
          top: ${positions[0]}px;
        }
      `;
    }

    if (positions.length === 2) {
      return `
         0%,
        8% {
          top: ${positions[0]}px;
        }

        40% {
          top: ${positions[1]}px;
        }

        60% {
          top: ${positions[1]}px;
        }

        100% {
          top: ${positions[0]}px;
        }
      `;
    }

    const movementEnd = 80;
    const step = movementEnd / (positions.length - 1);

    let keyframes = "";

    positions.forEach((position, index) => {
      const arrival = index * step;
      const pauseDuration = step * 0.4;
      const pauseEnd = Math.min(arrival + pauseDuration, movementEnd);

      keyframes += `
        ${arrival}% {
          top: ${position}px;
        }

        ${pauseEnd}% {
          top: ${position}px;
        }
      `;
    });

    keyframes += `
      100% {
        top: ${positions[0]}px;
      }
    `;
    return keyframes;
  };

  const animationDuration = Math.max(activitiesArray.length * 1.5, 3);

  return (
    <div ref={timelineRef} className="relative mt-4">
      {positions.length === activitiesArray.length && (
        <>
          <style>
            {`
             @keyframes activity-timeline-ball {
                ${generateKeyFrames()}
              }

              .animate-time-ball {
                animation: activity-timeline-ball
                  ${animationDuration}s
                  ease-in-out
                  infinite;
              }
          `}
          </style>
          <span className="animate-time-ball absolute left-0 z-10 h-3 w-3 rounded-full bg-button" />
        </>
      )}

      {activitiesArray.map((activity, index) => (
        <div
          key={activity?.id}
          className="relative flex gap-3 border-b border-line pb-4 pt-4 first:pt-0 last:border-0 last:pb-0"
        >
          {index !== activitiesArray.length - 1 && (
            <span className="absolute left-1.25 top-3 bottom-0 w-px bg-line" />
          )}
          <span
            ref={(element) => {
              holeRefs.current[index] = element;
            }}
            className="relative z-1 mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-line bg-white"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-5 text-heading">{activity?.action}</p>
            <p className="mt-0.5 text-xs text-muted">{activity?.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RealTimeActivityLog;
