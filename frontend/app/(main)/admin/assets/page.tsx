"use client";

import AssetComponent from "@/components/AssetComponent";
import api from "@/lib/axios";
import { AssetType } from "@/lib/types";
import { useEffect, useState } from "react";

const AssetPage = () => {
  const [openAssetComponent, setOpenAssetComponent] = useState<boolean>(false);
  const [assets, setAssets] = useState<AssetType[]>([]);

  useEffect(() => {
    const getAssets = async (): Promise<void> => {
      try {
        const response = await api.get("/assets");
        setAssets(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    getAssets();
  }, []);
  return (
    <div>
      <div>
        <h1>Master Inventory</h1>
        <p>Every registered asset, its department and its status</p>
        <div>
          <button
            type="button"
            onClick={() => setOpenAssetComponent((prev) => !prev)}
          >
            + Add asset
          </button>
        </div>
      </div>

      <div>{openAssetComponent && <AssetComponent />}</div>

      <div>
        {assets.length < 1 ? (
          <div>
            <p>No asset registered, please register an asset</p>
            <button
              type="button"
              onClick={() => setOpenAssetComponent((prev) => !prev)}
            >
              + Add asset
            </button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ASSET TAG</th>
                <th>TYPE</th>
                <th>DEPARTMENT</th>
                <th>STATUS</th>
                <th>LAST SERVICED</th>
                <th>NOTES</th>
                <th>ASSIGNED TO</th>
              </tr>
            </thead>
            <tbody>
              {assets?.map((asset) => (
                <tr key={asset.id}>
                  <td>{asset.reference}</td>
                  <td>{asset.type}</td>
                  <td>{asset.department}</td>
                  <td>{asset.status}</td>
                  <td>
                    {asset.last_serviced === null
                      ? "No last service date"
                      : asset.last_serviced}
                  </td>
                  <td>
                    {asset.notes === null ? "No notes available" : asset.notes}
                  </td>
                  <td>{asset.assignee_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AssetPage;
