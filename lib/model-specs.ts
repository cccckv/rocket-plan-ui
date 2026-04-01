export interface ModelSpecs {
  supportedResolutions: string[];
  supportedAspectRatios: string[];
  supportedDurations: number[];
  maxDuration: number;
  minDuration: number;
  supports4K: boolean;
  supportsAudio: boolean;
}

export const MODEL_SPECIFICATIONS: Record<string, ModelSpecs> = {
  'veo3.1-fast': {
    supportedResolutions: ['720P', '1080P'],
    supportedAspectRatios: ['16:9', '9:16'],
    supportedDurations: [4, 5, 6, 7, 8],
    maxDuration: 8,
    minDuration: 4,
    supports4K: false,
    supportsAudio: true,
  },
  'veo3-fast': {
    supportedResolutions: ['720P', '1080P'],
    supportedAspectRatios: ['16:9', '9:16'],
    supportedDurations: [4, 5, 6, 7, 8],
    maxDuration: 8,
    minDuration: 4,
    supports4K: false,
    supportsAudio: true,
  },
  'veo3.1': {
    supportedResolutions: ['720P', '1080P'],
    supportedAspectRatios: ['16:9', '9:16'],
    supportedDurations: [4, 5, 6, 7, 8],
    maxDuration: 8,
    minDuration: 4,
    supports4K: false,
    supportsAudio: true,
  },
  'veo3.1-components': {
    supportedResolutions: ['720P', '1080P'],
    supportedAspectRatios: ['16:9', '9:16'],
    supportedDurations: [4, 5, 6, 7, 8],
    maxDuration: 8,
    minDuration: 4,
    supports4K: false,
    supportsAudio: true,
  },
  'veo3': {
    supportedResolutions: ['720P', '1080P'],
    supportedAspectRatios: ['16:9', '9:16'],
    supportedDurations: [4, 5, 6, 7, 8],
    maxDuration: 8,
    minDuration: 4,
    supports4K: false,
    supportsAudio: true,
  },
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
