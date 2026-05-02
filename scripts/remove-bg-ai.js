const fs = require('fs');
const path = require('path');

async function main() {
  const { removeBackground } = require('@imgly/background-removal-node');
  const menuDir = path.join(__dirname, '../public/menu');
  const files = fs.readdirSync(menuDir).filter(file => file.toLowerCase().endsWith('.png'));
  
  console.log(`Found ${files.length} images to process. This may take a moment to download the AI model on first run...`);

  for (const file of files) {
    const filePath = path.join(menuDir, file);
    try {
      console.log(`Processing: ${file}`);
      
      // Pass the file URI scheme as recommended by imgly docs
      const fileUri = `file://${filePath.replace(/\\/g, '/')}`;
      
      const blob = await removeBackground(fileUri);
      const arrayBuffer = await blob.arrayBuffer();
      const resultBuffer = Buffer.from(arrayBuffer);
      
      fs.writeFileSync(filePath, resultBuffer);
      console.log(`Success: ${file}`);
    } catch (e) {
      console.error(`Error on ${file}:`, e.message || e);
    }
  }
  console.log('Finished removing backgrounds!');
}

main().catch(console.error);
