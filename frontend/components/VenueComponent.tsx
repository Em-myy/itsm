"use client";

import api from "@/src/lib/axios";
import { AssetType } from "@/src/lib/types";
import { useEffect, useState } from "react";

interface InputType {
  name: string;
  capacity: number | "";
}

const VenueComponent = () => {
  const [assets, setAssets] = useState<AssetType[]>([]);
  const [inputType, setInputType] = useState<InputType>({
    name: "",
    capacity: "",
  });
  const [status, setStatus] = useState<string>("");
  const [equipments, setEquipments] = useState<string[]>([]);

  useEffect(() => {
    const getAssets = async (): Promise<void> => {
      try {
        const response = await api.get("/assets");
        console.log(response.data);
        setAssets(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    getAssets();
  }, []);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setInputType({ ...inputType, [event.target.name]: event.target.value });
  };

  const handleStatus = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setStatus(event.target.value);
  };

  const handleEquipment = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setEquipments((prev) =>
      event.target.checked
        ? [...prev, event.target.value]
        : prev.filter((equipment) => equipment !== event.target.value),
    );
  };

  const handleSubmit = async (
    event: React.SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    const venuePayload = {
      name: inputType.name,
      capacity: Number(inputType.capacity),
      status: status,
      equipments: equipments,
    };

    try {
      await api.post("/venues", venuePayload);
      console.log("Venue created successfully");
      setInputType({
        name: "",
        capacity: 0,
      });
      setStatus("");
      setEquipments([]);
    } catch (error: any) {
      console.log(error.response.data);
    }
  };
  return (
    <div>
      <h1>Add a venue</h1>
      <div>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Venue Name</label>
            <input
              type="text"
              name="name"
              value={inputType.name}
              required
              placeholder="Main Hall 3"
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Capacity</label>
            <input
              type="number"
              name="capacity"
              value={inputType.capacity}
              required
              min={1}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <select
              name="status"
              value={status}
              required
              onChange={handleStatus}
            >
              <option value="">Select the status of the venue</option>
              <option value="Active">Active</option>
              <option value="In Repair">In Repair</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
          <div>
            {assets.length < 1 ? (
              <p>No asset, please add an asset</p>
            ) : (
              assets.map((asset) => {
                const assetLabel = `${asset.reference} - ${asset.type}`;
                return (
                  <label key={asset.id}>
                    <input
                      type="checkbox"
                      value={assetLabel}
                      checked={equipments.includes(assetLabel)}
                      onChange={handleEquipment}
                    />
                    {assetLabel}
                  </label>
                );
              })
            )}
          </div>
          <button>Add Venue</button>
        </form>
      </div>
    </div>
  );
};

export default VenueComponent;
