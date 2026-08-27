"use client";

import api from "@/src/lib/axios";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

interface TicketType {
  reference: string;
  title: string;
  category: string;
  department: string;
  priority: string;
  related_asset: string;
  description: string;
  created_at: string;
}

interface InputType {
  title: string;
  priority: string;
}

interface SelectType {
  category: string;
  department: string;
  relatedAsset: string;
}

const SubmitTicketPage = () => {
  const [tickets, setTickets] = useState<TicketType[] | null>(null);
  const [inputElements, setInputElements] = useState<InputType>({
    title: "",
    priority: "",
  });
  const [description, setDescription] = useState<string>("");
  const [selectElements, setSelectElements] = useState<SelectType>({
    category: "",
    department: "",
    relatedAsset: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const supabase = createClient();

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

      const response = await api.post("/tickets", ticketPayload);
      console.log(response.data);

      setInputElements({
        title: "",
        priority: "",
      });
      setDescription("");
      setSelectElements({
        category: "",
        department: "",
        relatedAsset: "",
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchTickets = async (): Promise<void> => {
      try {
        const response = await api.get("/tickets/mine");
        setTickets(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTickets();
  }, []);

  return (
    <div>
      <div>
        <h1>Report an issue</h1>
        <p>The IT unit reviews new tickets within one business day</p>
      </div>
      <div>
        <div>
          <form onSubmit={handleSubmit}>
            <div>
              <label>What's wrong?</label>
              <input
                type="text"
                required
                placeholder="e.g. Laptop won't turn on"
                name="title"
                value={inputElements.title}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <div>
                <label>Category</label>
                <select
                  name="category"
                  value={selectElements.category}
                  onChange={handleSelectChange}
                >
                  <option value="Hardware">Hardware</option>
                  <option value="Network">Network</option>
                  <option value="Software">Software</option>
                  <option value="Printing">Printing</option>
                  <option value="Power / UPS">Power / UPS</option>
                </select>
              </div>
              <div>
                <label>Department</label>
                <select
                  name="department"
                  value={selectElements.department}
                  onChange={handleSelectChange}
                >
                  <option value="Admin/HR">Admin/HR</option>
                  <option value="Environment">Environment</option>
                  <option value="Education">Education</option>
                  <option value="Tourism">Tourism</option>
                  <option value="Finance">Finance</option>
                  <option value="ICT">ICT</option>
                </select>
              </div>
            </div>

            <div>
              <h4>Priority</h4>
              <div>
                <div>
                  <label>Low</label>
                  <input
                    type="radio"
                    name="priority"
                    value="Low"
                    checked={inputElements.priority === "Low"}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label>Normal</label>
                  <input
                    type="radio"
                    name="priority"
                    value="Normal"
                    checked={inputElements.priority === "Normal"}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label>Urgent</label>
                  <input
                    type="radio"
                    name="priority"
                    value="Urgent"
                    checked={inputElements.priority === "Urgent"}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div>
              <label>
                Related Asset <span>(optional)</span>
              </label>

              <div>
                <select
                  name="relatedAsset"
                  value={selectElements.relatedAsset}
                  onChange={handleSelectChange}
                >
                  <option value="None - not tied to a registered asset">
                    None - not tied to a registered asset
                  </option>
                  {tickets?.map((ticket) => (
                    <option
                      value={`${ticket.reference}`}
                      key={ticket.reference}
                    >
                      {ticket.reference + " - " + ticket.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label>Describe what's happening</label>
              <textarea
                placeholder="What did you expect to happen, and what happened instead?"
                name="description"
                value={description}
                onChange={handleDescriptionChange}
              />
            </div>

            <div>
              <label>
                Attach a picture <span>(optional)</span>
              </label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            <div>
              <p>KEEP THIS REFERENCE FOR YOUR RECORDS</p>
              <p>DRAFT</p>
            </div>
            <button>Submit ticket</button>
          </form>
        </div>
        <div>
          <h3>What happens next</h3>
          <div>
            <div>
              <h4>Submitted</h4>
              <p>You'll get a reference number immediately</p>
            </div>
            <div>
              <h4>Reviewed</h4>
              <p>An IT staff triggers it and sets a priority</p>
            </div>
            <div>
              <h4>In progress</h4>
              <p>You'll see it as pending</p>
            </div>
            <div>
              <h4>Resolved</h4>
              <p>Marked closed once the fix is complete</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitTicketPage;
