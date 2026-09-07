"use client";

import { DEPARTMENTS, TicketType } from "@/lib/types";
import { AlertCircle } from "lucide-react";
import { useRef, useState } from "react";

export interface TicketFormValues {
  ticketId: number;
  title: string;
  category: string;
  department: string;
  priority: string;
  relatedAsset: string;
  description: string;
  file: File | null;
}

interface TicketFormProps {
  relatedTickets: TicketType[] | null;
  initialValues?: Partial<Omit<TicketFormValues, "file">>;
  showFileUpload?: boolean;
  beforeActions?: React.ReactNode;
  submitLabel: string;
  submittingLabel: string;
  cancelLabel?: string;
  onSubmit: (values: TicketFormValues) => Promise<void>;
  onCancel?: () => void;
}

const inputClass =
  "w-full rounded-xl border border-line bg-input-bg px-4 py-3 text-sm text-heading placeholder:text-muted outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2";

const PRIORITIES = ["Low", "Normal", "Urgent"];

const TicketForm = ({
  relatedTickets,
  initialValues,
  showFileUpload = false,
  beforeActions,
  submitLabel,
  submittingLabel,
  cancelLabel,
  onSubmit,
  onCancel,
}: TicketFormProps) => {
  const ticketId = initialValues?.ticketId ?? "";
  const [title, setTitle] = useState<string>(initialValues?.title ?? "");
  const [category, setCategory] = useState<string>(
    initialValues?.category ?? "Hardware",
  );
  const [department, setDepartment] = useState<string>(
    initialValues?.department ?? "Admin/HR",
  );
  const [priority, setPriority] = useState<string>(
    initialValues?.priority ?? "",
  );
  const [relatedAsset, setRelatedAsset] = useState<string>(
    initialValues?.relatedAsset ?? "None - not tied to a registered asset",
  );
  const [description, setDescription] = useState<string>(
    initialValues?.description ?? "",
  );
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleClearFile = () => {
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (
    event: React.SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        ticketId: Number(ticketId),
        title,
        category,
        department,
        priority,
        relatedAsset,
        description,
        file,
      });
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-heading">
            Category
          </label>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
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
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
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
        <h4 className="mb-2 text-sm font-medium text-heading">Priority</h4>
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
                checked={priority === level}
                onChange={(event) => setPriority(event.target.value)}
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
          value={relatedAsset}
          onChange={(event) => setRelatedAsset(event.target.value)}
          className={inputClass}
        >
          <option value="None - not tied to a registered asset">
            None - not tied to a registered asset
          </option>
          {relatedTickets?.map((ticket) => (
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
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={5}
          className={`${inputClass} resize-y`}
        />
      </div>

      {showFileUpload && (
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
              <span className="truncate text-sm text-body">{file.name}</span>
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
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {beforeActions}

      <div className="flex gap-3 pt-2">
        {cancelLabel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-line py-3 text-sm font-semibold text-heading transition hover:bg-input-bg cursor-pointer"
          >
            {cancelLabel}
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-xl bg-button py-3 text-sm font-semibold text-white transition hover:bg-button-hover disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default TicketForm;
