export interface ModelSpecs {
  supportedResolutions: string[];
  supportedAspectRatios: string[];
  supportedDurations: number[];
  maxDuration: number;
  minDuration: number;
  supports4K: boolean;
  supportsAudio: boolean;
}

const standardSpecs: ModelSpecs = {
  supportedResolutions: ['720P', '1080P'],
  supportedAspectRatios: ['16:9', '9:16'],
  supportedDurations: [4, 5, 6, 7, 8],
  maxDuration: 8,
  minDuration: 4,
  supports4K: false,
  supportsAudio: true,
};

const highQuality4KSpecs: ModelSpecs = {
  supportedResolutions: ['720P', '1080P', '4K'],
  supportedAspectRatios: ['16:9', '9:16'],
  supportedDurations: [4, 5, 6, 7, 8],
  maxDuration: 8,
  minDuration: 4,
  supports4K: true,
  supportsAudio: true,
};

export const MODEL_SPECIFICATIONS: Record<string, ModelSpecs> = {
  'veo3.1': standardSpecs,
  'veo3.1-fast': standardSpecs,
  'veo3.1-pro': standardSpecs,
  'veo3.1-components': standardSpecs,
  'veo3.1-fast-components': standardSpecs,
  'veo3': standardSpecs,
  'veo3-fast': standardSpecs,
  'veo3-pro': standardSpecs,
  'veo3-fast-frames': standardSpecs,
  'veo3-frames': standardSpecs,
  'veo3-pro-frames': standardSpecs,
  'veo3.1-4k': highQuality4KSpecs,
  'veo3.1-components-4k': highQuality4KSpecs,
  'veo3.1-pro-4k': highQuality4KSpecs,
  'veo_3_1-fast': standardSpecs,
  'veo_3_1': standardSpecs,
};

export const DEFAULT_MODEL_SPECS: ModelSpecs = {
  supportedResolutions: ['720P', '1080P'],
  supportedAspectRatios: ['16:9', '9:16'],
  supportedDurations: [4, 5, 6, 7, 8],
  maxDuration: 8,
  minDuration: 4,
  supports4K: false,
  supportsAudio: true,
};

export function getModelSpecs(modelName: string): ModelSpecs {
  return MODEL_SPECIFICATIONS[modelName] || DEFAULT_MODEL_SPECS;
}
