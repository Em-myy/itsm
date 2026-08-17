"use client";

import api from "@/src/lib/axios";
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

interface SelectType {
  category: string;
  department: string;
  relatedAsset: string;
}

const SubmitTicketPage = () => {
  const [tickets, setTickets] = useState<TicketType[] | null>(null);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectElements, setSelectElements] = useState<SelectType>({
    category: "",
    department: "",
    relatedAsset: "",
  });

  const handleTitleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setTitle(event.target.value);
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
          <form>
            <div>
              <label>What's wrong?</label>
              <input
                type="text"
                required
                placeholder="e.g. Laptop won't turn on"
                name="title"
                value={title}
                onChange={handleTitleChange}
              />
            </div>

            <div>
              <div>
                <label>Category</label>
                <select
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
                <select>
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
                  <input type="radio" required />
                </div>
                <div>
                  <label>Normal</label>
                  <input type="radio" required />
                </div>
                <div>
                  <label>Urgent</label>
                  <input type="radio" required />
                </div>
              </div>
            </div>

            <div>
              <label>
                Related Asset <span>(optional)</span>
              </label>
              <select>
                <option>None - not tied to a registered asset</option>
                {tickets?.map((ticket) => (
                  <option key={ticket.reference}>
                    {ticket.reference + " - " + ticket.title}
                  </option>
                ))}
              </select>
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
              <input type="file" />
            </div>
          </form>
        </div>
        <div>
          <h3>What happens next</h3>
        </div>
      </div>
    </div>
  );
};

export default SubmitTicketPage;
