// frontend/src/utils/colorUtils.js
// Small color utilities: sample dominant color from an image File, hex<->rgb, distance.

export function rgbToHex(r, g, b) {
  const toHex = (n) => {
    const s = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return s.length === 1 ? "0" + s : s;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hexToRgb(hex) {
  if (!hex) return null;
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
  return {
    r: parseInt(hex.slice(0,2), 16),
    g: parseInt(hex.slice(2,4), 16),
    b: parseInt(hex.slice(4,6), 16)
  };
}

export function colorDistanceHex(aHex, bHex){
  const a = hexToRgb(aHex);
  const b = hexToRgb(bHex);
  if (!a || !b) return 99999;
  return Math.sqrt(
    Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2)
  );
}

/**
 * sampleDominantColorFromFile(file) -> Promise<hex>
 * - loads the File into an offscreen canvas, downsamples, excludes near-white background,
 *   and returns the average RGB as a hex string.
 */
export async function sampleDominantColorFromFile(file, sampleSize = 120) {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      const url = URL.createObjectURL(file);
      img.onload = () => {
        try {
          // draw image to canvas scaled to sampleSize (preserve aspect)
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const ar = img.width / img.height;
          let W = sampleSize, H = Math.round(sampleSize / ar);
          if (H < 20) H = 20;
          canvas.width = W;
          canvas.height = H;
          // fill white background then draw
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0,0,W,H);
          ctx.drawImage(img, 0, 0, W, H);
          const data = ctx.getImageData(0,0,W,H).data;
          let rSum = 0, gSum = 0, bSum = 0, count = 0;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
            if (a < 50) continue; // transparency
            // skip near-white pixels (background)
            if (r > 245 && g > 245 && b > 245) continue;
            // skip near-black noise if desired? keep
            rSum += r; gSum += g; bSum += b;
            count++;
          }
          URL.revokeObjectURL(url);
          if (count === 0) {
            // fallback average including white
            resolve("#ffffff");
            return;
          }
          const rAvg = rSum / count, gAvg = gSum / count, bAvg = bSum / count;
          resolve(rgbToHex(rAvg, gAvg, bAvg));
        } catch (err) {
          URL.revokeObjectURL(url);
          resolve("#ffffff");
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve("#ffffff");
      };
      img.src = url;
    } catch (e) {
      reject(e);
    }
  });
}
