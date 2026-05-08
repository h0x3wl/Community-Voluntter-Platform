import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.join(process.cwd(), 'public');

async function optimizeImages() {
  const files = fs.readdirSync(publicDir);
  for (const file of files) {
    if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      const filePath = path.join(publicDir, file);
      const stat = fs.statSync(filePath);
      
      // If file is larger than 200KB, optimize it
      if (stat.size > 200 * 1024) {
        console.log(`Optimizing ${file} (Original size: ${Math.round(stat.size / 1024)}KB)`);
        const tempPath = path.join(publicDir, `temp-${file}`);
        
        await sharp(filePath)
          .resize({ width: 1200, withoutEnlargement: true }) // limit max width
          .jpeg({ quality: 80, force: false })
          .png({ quality: 80, compressionLevel: 8, force: false })
          .toFile(tempPath);
          
        fs.renameSync(tempPath, filePath);
        
        const newStat = fs.statSync(filePath);
        console.log(`Optimized ${file} (New size: ${Math.round(newStat.size / 1024)}KB)`);
      }
    }
  }
}

optimizeImages().catch(console.error);
