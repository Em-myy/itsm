"use client";

import api from "@/src/lib/axios";
import { DEPARTMENTS } from "@/src/lib/types";
import { useState } from "react";

interface InputType {
  type: string;
  assignedTo: string;
}

interface SelectType {
  department: string;
  status: string;
}

const AssetComponent = () => {
  const [inputType, setInputType] = useState<InputType>({
    type: "",
    assignedTo: "",
  });
  const [selectType, setSelectType] = useState<SelectType>({
    department: "",
    status: "",
  });

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setInputType({ ...inputType, [event.target.name]: event.target.value });
  };

  const handleSelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setSelectType({ ...selectType, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (
    event: React.SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    const assetPayload = {
      type: inputType.type,
      department: selectType.department,
      status: selectType.status,
      assignee_name: inputType.assignedTo,
    };

    try {
      const response = await api.post("/assets", assetPayload);
      console.log("Asset created successfully");
      setInputType({
        type: "",
        assignedTo: "",
      });
      setSelectType({
        department: "",
        status: "",
      });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <h1>Add an asset</h1>
      <div>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Asset type</label>
            <input
              type="text"
              name="type"
              value={inputType.type}
              required
              placeholder="e.g. HP Elitebook 840"
              onChange={handleInputChange}
            />
          </div>
          <div>
            <div>
              <label>Department</label>
              <select
                name="department"
                value={selectType.department}
                required
                onChange={handleSelectChange}
              >
                <option value="" disabled>
                  Select a department
                </option>
                {DEPARTMENTS.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Status</label>
              <select
                name="status"
                value={selectType.status}
                required
                onChange={handleSelectChange}
              >
                <option value="" disabled>
                  Select the status of the asset
                </option>
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
          </div>
          <div>
            <label>
              Assigned to <span>(optional)</span>
            </label>
            <input
              type="text"
              name="assignedTo"
              value={inputType.assignedTo}
              placeholder="Staff name, or leave blank if shared"
              onChange={handleInputChange}
            />
          </div>
          <button>Add to register</button>
        </form>
      </div>
    </div>
  );
};

export default AssetComponent;
