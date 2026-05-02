const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const colorDiff = require('color-diff');

const menuDir = path.join(__dirname, '../public/menu');
const PURE_WHITE = { R: 255, G: 255, B: 255 };

async function processImage(filePath) {
  try {
    const { data, info } = await sharp(filePath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Cache computed diffs to speed up processing
    const cache = new Map();

    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Fast skip for obvious non-whites
      if (r < 200 || g < 200 || b < 200) {
        continue;
      }

      const key = `${r},${g},${b}`;
      let diffValue = cache.get(key);
      if (diffValue === undefined) {
        diffValue = colorDiff.diff(PURE_WHITE, { R: r, G: g, B: b });
        cache.set(key, diffValue);
      }

      // Check both simple RGB distance and color-diff perceptual distance
      // ~30 from pure white in RGB terms
      const isNearWhiteRGB = (255 - r) <= 35 && (255 - g) <= 35 && (255 - b) <= 35;
      
      if (isNearWhiteRGB || diffValue < 10) {
        data[i + 3] = 0; // set alpha to 0 (transparent)
      }
    }

    await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: info.channels
      }
    })
    .png()
    .toFile(filePath);

    console.log(`Processed: ${path.basename(filePath)}`);
  } catch (err) {
    console.error(`Error processing ${path.basename(filePath)}:`, err);
  }
}

async function main() {
  if (!fs.existsSync(menuDir)) {
    console.error(`Directory not found: ${menuDir}`);
    return;
  }

  const files = fs.readdirSync(menuDir).filter(file => file.toLowerCase().endsWith('.png'));
  console.log(`Found ${files.length} PNG files in /public/menu/`);
  
  for (const file of files) {
    await processImage(path.join(menuDir, file));
  }
  
  console.log('Background removal complete!');
}

main();
