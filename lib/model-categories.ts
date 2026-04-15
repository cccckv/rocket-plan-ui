export interface ModelCategory {
  supportsFrameControl: boolean;
  frameControlType?: 'start' | 'end' | 'both';
}

export const MODEL_CATEGORIES: Record<string, ModelCategory> = {
  'veo3.1': { supportsFrameControl: true, frameControlType: 'both' },
  'veo3.1-fast': { supportsFrameControl: true, frameControlType: 'both' },
  'veo3.1-pro': { supportsFrameControl: true, frameControlType: 'both' },
  'veo3.1-pro-4k': { supportsFrameControl: true, frameControlType: 'both' },
  'veo3.1-components-4k': { supportsFrameControl: true, frameControlType: 'start' },
  'veo3-pro-frames': { supportsFrameControl: true, frameControlType: 'start' },
  'veo3-fast-frames': { supportsFrameControl: true, frameControlType: 'start' },
  'veo3-frames': { supportsFrameControl: true, frameControlType: 'start' },
  'veo3.1-4k': { supportsFrameControl: false },
  'veo3.1-components': { supportsFrameControl: false },
  'veo3.1-fast-components': { supportsFrameControl: false },
  'veo3': { supportsFrameControl: false },
  'veo3-fast': { supportsFrameControl: false },
  'veo3-pro': { supportsFrameControl: false },
};

export function getAvailableModels(tabType: 'reference' | 'frame'): string[] {
  if (tabType === 'frame') {
    return Object.keys(MODEL_CATEGORIES).filter(
      (model) => MODEL_CATEGORIES[model].supportsFrameControl
    );
  }
  
  return Object.keys(MODEL_CATEGORIES).filter(
    (model) => !MODEL_CATEGORIES[model].supportsFrameControl
  );
}

export function isModelAvailableForTab(model: string, tabType: 'reference' | 'frame'): boolean {
  const category = MODEL_CATEGORIES[model];
  if (!category) return true;
  
  if (tabType === 'frame') {
    return category.supportsFrameControl;
  }
  
  return !category.supportsFrameControl;
}
