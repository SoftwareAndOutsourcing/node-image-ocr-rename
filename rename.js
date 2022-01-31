import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { execaCommandSync } from 'execa';

if (process.argv.length !== 4) {
  console.log('Invalid arguments');
  process.exit();
}

const inputDir = process.argv[2];
const outputDir = process.argv[3];
const tmpDir = os.tmpdir();

// create output folder if not exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
  console.log(`Created ${outputDir} folder\n`)
}

const filenames = fs.readdirSync(inputDir)
  .filter(fn => fn.endsWith('.jpg'));

for (const filename of filenames) {
  const sourceImagePath = path.join(inputDir, filename);
  console.log('Source: ' + sourceImagePath);

  const croppedImagePath = path.join(tmpDir, filename);
  // create cropped image
  execaCommandSync(
    `convert -resize 250% -gravity NorthEast -crop 100x5%x+0+0 `
    + `${sourceImagePath} ${croppedImagePath}`
  );
  console.log('Cropped: ' + croppedImagePath);

  // extract text
  const { stdout } = execaCommandSync(
    `tesseract ${croppedImagePath} stdout quiet `
    + `| grep ".mp4" `
    + `| awk '{print $2}' `
    + `| sed 's/.mp4.mp4/.mp4/g' `
    + `| sed 's/.mp4/.jpg/g'`,
    { shell: true }
  );
  console.log('Text: ' + stdout);

  // remove cropped image
  fs.unlinkSync(croppedImagePath);

  // copy file to output folder
  if (stdout.endsWith('.jpg')
  // check if valid file name
  && stdout === path.basename(stdout)) {
    const destImagePath = path.join(outputDir, stdout);
    if (fs.existsSync(destImagePath)) {
      fs.unlinkSync(destImagePath);      
    }
    fs.copyFileSync(sourceImagePath, destImagePath);
    console.log('Copied: ' + destImagePath);
  } else {
    console.warn('Skipped: ' + stdout);
  }
  console.log();
}
