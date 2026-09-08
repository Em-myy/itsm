import { fetchFromGo } from "@/lib/api-server";
import { AssetType } from "@/lib/types";
import AssetClientPage from "./AssetClientPage";

const AssetPage = async () => {
  const assets = (await fetchFromGo("/assets")) as AssetType[] | [];
  return <AssetClientPage initialAssets={assets} />;
};

export default AssetPage;
