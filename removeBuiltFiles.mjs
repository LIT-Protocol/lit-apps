// removeFiles.mjs
import fs from 'fs';
import path from 'path';

function removeFilesFromDir(startPath, fileExtensions) {
    if (!fs.existsSync(startPath)) {
        console.log('Directory not found:', startPath);
        return;
    }

    const files = fs.readdirSync(startPath);

    for (let file of files) {
        const filePath = path.join(startPath, file);
        const stat = fs.lstatSync(filePath);

        if (stat.isDirectory()) {
            removeFilesFromDir(filePath, fileExtensions); // Recurse into subdirectories
        } else if (fileExtensions.some(ext => filePath.endsWith(ext))) {
            fs.unlinkSync(filePath); // Remove file
            console.log('Removed:', filePath);
        }
    }
}

const targetPath = process.argv[2];

if (!targetPath) {
    console.log('Please provide a path as an argument.');
    process.exit(1);
}

const extensionsToRemove = ['.d.ts', '.d.ts.map', '.js'];

removeFilesFromDir(targetPath, extensionsToRemove);
