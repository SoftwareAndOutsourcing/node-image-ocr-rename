import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { execaCommandSync } from 'execa';

const inputFolder = './input';
const tmpDir = os.tmpdir();
let filenames = fs.readdirSync(inputFolder)
  .filter(fn => fn.endsWith('.jpg'));

for (const filename of filenames) {
  const sourceImage = path.join(inputFolder, filename);
  console.log('Source: ' + sourceImage);

  const croppedImage = path.join(tmpDir, filename);
  // crop top of the image
  execaCommandSync(
    `convert -resize 250% -gravity NorthEast -crop 100x5%x+0+0 `
    + `${sourceImage} ${croppedImage}`
  );
  console.log('Cropped: ' + croppedImage);

  // extract text
  const { stdout } = execaCommandSync(
    `tesseract ${croppedImage} stdout quiet `
    + `| grep ".mp4" `
    + `| awk '{print $2}' `
    + `| sed 's/.mp4.mp4/.mp4/g' `
    + `| sed 's/.mp4/.jpg/g'`,
    { shell: true }
  );
  console.log('Text: ' + stdout + '\n');

  fs.unlinkSync(croppedImage);
}



