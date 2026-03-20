import { Asset } from "expo-asset";

export async function resolveAssetPath(module: number): Promise<string> {
  const [asset] = await Asset.loadAsync(module);
  if (!asset.localUri) throw new Error("Failed to load asset");
  return asset.localUri;
}
