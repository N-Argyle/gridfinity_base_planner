declare module "three/examples/jsm/loaders/STLLoader" {
  import { type BufferGeometry, Loader, type LoadingManager } from "three";

  export class STLLoader extends Loader {
    constructor(manager?: LoadingManager);
    load(
      url: string,
      onLoad: (geometry: BufferGeometry) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (event: ErrorEvent) => void,
    ): void;
    parse(data: ArrayBuffer | string): BufferGeometry;
  }
}
