"use client";

import api from "@/lib/axios";
import { DEPARTMENTS, TicketType } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { fi } from "date-fns/locale";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface InputType {
  title: string;
  priority: string;
}

interface SelectType {
  category: string;
  department: string;
  relatedAsset: string;
}

const inputClass =
  "w-full rounded-xl border border-line bg-input-bg px-4 py-3 text-sm text-heading placeholder:text-muted outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2";

const PRIORITIES = ["Low", "Normal", "Urgent"];

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inputElements, setInputElements] = useState<InputType>({
    title: "",
    priority: "",
  });
  const [description, setDescription] = useState<string>("");
  const [selectElements, setSelectElements] = useState<SelectType>({
    category: "Hardware",
    department: "Admin/HR",
    relatedAsset: "None - not tied to a registered asset",
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleClearFile = () => {
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setInputElements({
      ...inputElements,
      [event.target.name]: event.target.value,
    });
  };

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ): void => {
    setDescription(event.target.value);
  };

  const handleSelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setSelectElements({
      ...selectElements,
      [event.target.name]: event.target.value,
    });
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (
    event: React.SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      let pictureUrl: string[] = [];

      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("ticket-attachments")
          .upload(fileName, file);

        if (uploadError) {
          throw new Error(`Upload Failed: ${uploadError.message}`);
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("ticket-attachments").getPublicUrl(fileName);

        pictureUrl.push(publicUrl);
      }

      const ticketPayload = {
        title: inputElements.title,
        category: selectElements.category,
        department: selectElements.department,
        priority: inputElements.priority,
        related_asset: selectElements.relatedAsset,
        description: description,
        picture: pictureUrl,
      };

      await api.post("/tickets", ticketPayload);

      router.refresh();
      router.push("/staff/tickets");
    } catch (error) {
      console.log(error);
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong submitting your ticket. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
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
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-heading">
                What&apos;s wrong?
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Laptop won't turn on"
                name="title"
                value={inputElements.title}
                onChange={handleInputChange}
                className={inputClass}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-heading">
                  Category
                </label>
                <select
                  name="category"
                  value={selectElements.category}
                  onChange={handleSelectChange}
                  className={inputClass}
                >
                  <option value="Hardware">Hardware</option>
                  <option value="Network">Network</option>
                  <option value="Software">Software</option>
                  <option value="Printing">Printing</option>
                  <option value="Power / UPS">Power / UPS</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-heading">
                  Department
                </label>
                <select
                  name="department"
                  value={selectElements.department}
                  onChange={handleSelectChange}
                  className={inputClass}
                >
                  {DEPARTMENTS.map((dept) => (
                    <option value={dept} key={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium text-heading">
                Priority
              </h4>
              <div className="flex overflow-hidden rounded-lg border border-line">
                {PRIORITIES.map((level) => (
                  <label
                    key={level}
                    className="flex-1 cursor-pointer bg-input-bg py-3 text-center text-sm font-semibold text-body transition has-checked:bg-button has-checked:text-white has-focus-visible:ring-2 has-focus-visible:ring-emerald-600 has-focus-visible:ring-offset-2 has-not-checked:hover:bg-surface-hover"
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={level}
                      checked={inputElements.priority === level}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    {level}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-heading">
                Related Asset <span className="text-muted">(optional)</span>
              </label>

              <select
                name="relatedAsset"
                value={selectElements.relatedAsset}
                onChange={handleSelectChange}
                className={inputClass}
              >
                <option value="None - not tied to a registered asset">
                  None - not tied to a registered asset
                </option>
                {initialTickets?.map((ticket) => (
                  <option value={`${ticket.reference}`} key={ticket.reference}>
                    {ticket.reference + " - " + ticket.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-heading">
                Describe what&apos;s happening
              </label>
              <textarea
                placeholder="What did you expect to happen, and what happened instead?"
                name="description"
                value={description}
                onChange={handleDescriptionChange}
                rows={5}
                className={`${inputClass} resize-y`}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-heading">
                Attach a picture <span className="text-muted">(optional)</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={`${inputClass} text-muted file:mr-4 file:cursor-pointer file:rounded-md file:border file:border-line file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-heading file:transition hover:file:bg-surface-hover`}
                ref={fileInputRef}
              />
              {file && (
                <div className="mt-2 flex items-center justify-between rounded-lg bg-input-bg px-3 py-2">
                  <span className="truncate text-sm text-body">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={handleClearFile}
                    className="ml-3 text-sm font-medium text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-dashed border-line pt-4">
              <p className="font-mono text-xs uppercase tracking-widest text-muted">
                Keep this reference for your records
              </p>
              <span className="rounded-md bg-input-bg px-2.5 py-1 font-mono text-xs text-muted">
                DRAFT
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-button py-3.5 text-sm font-semibold text-white transition hover:bg-button-hover focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
            >
              {isSubmitting ? "Submitting..." : "Submit ticket"}
            </button>
          </form>
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
