import { supabase } from "@/integrations/supabase/client";

export interface AnalysisResult {
  isBlurry: boolean;
  isScreenshot: boolean;
  blurScore: number;
  confidence: number;
}

// Convert file to base64 data URL
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Resize image to reduce size before sending to AI
async function resizeImage(file: File, maxWidth = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scale;
      
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export async function analyzePhoto(file: File): Promise<AnalysisResult> {
  try {
    // Quick filename check first
    const fileName = file.name.toLowerCase();
    const isLikelyScreenshot = 
      fileName.includes('screenshot') || 
      fileName.includes('screen_shot') ||
      fileName.includes('screen shot') ||
      fileName.startsWith('scr_') ||
      /screenshot[_-]?\d+/i.test(fileName);

    // Resize image to reduce data transfer
    const imageData = await resizeImage(file, 800);

    // Call the edge function for AI analysis
    const { data, error } = await supabase.functions.invoke('analyze-photo', {
      body: { imageData }
    });

    if (error) {
      console.error('Analysis error:', error);
      // Fallback to filename-based detection
      return {
        isBlurry: false,
        isScreenshot: isLikelyScreenshot,
        blurScore: 0,
        confidence: isLikelyScreenshot ? 80 : 50
      };
    }

    // Combine AI results with filename check
    return {
      ...data,
      isScreenshot: data.isScreenshot || isLikelyScreenshot
    };
  } catch (error) {
    console.error('Error analyzing photo:', error);
    return {
      isBlurry: false,
      isScreenshot: false,
      blurScore: 0,
      confidence: 0
    };
  }
}

// Simple perceptual hash for duplicate detection
async function getImageHash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Use small canvas for hash
    canvas.width = 8;
    canvas.height = 8;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 8, 8);
      const imageData = ctx?.getImageData(0, 0, 8, 8);
      if (!imageData) {
        resolve('');
        return;
      }

      // Calculate average brightness
      let sum = 0;
      for (let i = 0; i < imageData.data.length; i += 4) {
        sum += (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
      }
      const avg = sum / (imageData.data.length / 4);

      // Create hash based on pixels above/below average
      let hash = '';
      for (let i = 0; i < imageData.data.length; i += 4) {
        const brightness = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
        hash += brightness > avg ? '1' : '0';
      }

      resolve(hash);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Calculate hamming distance between two hashes
function hammingDistance(hash1: string, hash2: string): number {
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) distance++;
  }
  return distance;
}

export async function findDuplicates(files: File[]): Promise<Map<number, number[]>> {
  const hashes = await Promise.all(files.map(f => getImageHash(f)));
  const duplicates = new Map<number, number[]>();

  for (let i = 0; i < hashes.length; i++) {
    for (let j = i + 1; j < hashes.length; j++) {
      const distance = hammingDistance(hashes[i], hashes[j]);
      // If distance is less than 5, consider them similar
      if (distance < 5) {
        if (!duplicates.has(i)) {
          duplicates.set(i, []);
        }
        duplicates.get(i)?.push(j);
      }
    }
  }

  return duplicates;
}
