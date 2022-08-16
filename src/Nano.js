const MyEmitter = require("./EventService");
const sharp = require("sharp");
const path = require("path");
const os = require("node:os");
const fs = require("fs");
const config = require("./config");
let totalFiles = 0;
let processedFiles = 0;
let processPercentage = 0;
let photoQuality = config.QUALITY[0].value;
let logs = [];
let memoryConsuption = 0;
class Nano {
  constructor() {}

  _isFile(imagePath = null) {
    try {
      let stats = fs.statSync(imagePath);
      return stats.isFile();
    } catch (err) {
      console.error(err.stack);
      return false;
    }
  }

  _isDir(imagePath = null) {
    try {
      let stats = fs.lstatSync(imagePath);
      return stats.isDirectory();
    } catch (err) {
      console.error(err.stack);
      return false;
    }
  }

  _getQualityNameBYVal(val = 0) {
    let name = "HIGH";
    for (const iterator of config.QUALITY) {
      if (val === iterator.value) {
        name = iterator.key;
        break;
      }
    }
    return name;
  }

  /** Gate function is responsible for check if path is a image file or image folder 
    Then take action accordingly 
    **/
  async gate(imagePath = null, quality) {
    try {
      logs = [];
      memoryConsuption = 0;
      if (typeof quality != "undefined") photoQuality = quality;
      let result = {};
      let isFile = this._isFile(imagePath);
      let isDir = this._isDir(imagePath);
      if (isFile) {
        totalFiles = 1;
        await compress(imagePath);
      } else if (isDir) {
        let dirPath = imagePath;
        let responseReadDir = fs.readdirSync(imagePath);

        if (responseReadDir.length) {
          let mapResponseReadDir = [];
          for (const file of responseReadDir) {
            let filePath = dirPath + "/" + file;
            if (this._isFile(filePath)) {
              mapResponseReadDir.push(filePath);
            }
          }
          totalFiles = mapResponseReadDir.length;
          for (const file of mapResponseReadDir) {
            if (this._isDir(file)) continue; // Ignore if dir is nested directory
            await this.compress(file);
          }
          result.status = "success";
          result.msg = "Completed";
        } else {
          result.status = "failed";
          result.msg = "Sorry ! your entered folder is empty";
        }
      } else {
        result.status = "failed";
        result.msg =
          "Sorry! you have enter invalid image path or image folder path";
      }
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        msg: error,
      };
    }
  }

  /** Function for compress the image **/
  async compress(imagePath = null) {
    try {
      if (this._isFile(imagePath)) {
        let imageAbsPath = path.resolve(imagePath);
        let originalFileName = path.basename(imageAbsPath);

        let descFolder =
          path.resolve(path.dirname(imageAbsPath), "..") +
          "/" +
          config.TINY_DIR +
          "_" +
          this._getQualityNameBYVal(photoQuality);
        if (!fs.existsSync(descFolder)) {
          fs.mkdirSync(descFolder);
        }
        let descFileName = `${descFolder}/${originalFileName}`;

        /** Compress image () **/
        let response = await sharp(imageAbsPath)
          .jpeg({ quality: photoQuality })
          .toFile(descFileName);
        processedFiles += 1;
        let percentage = (processedFiles / totalFiles) * 100;
        processPercentage = Math.ceil(percentage);
        logs.push(`Your image ${processedFiles} of ${totalFiles} is written in: ${descFileName}`);
        console.log(
          `Your image ${processedFiles} of ${totalFiles} is written in: ${descFileName} | ${processPercentage}% Completed`
        );
        // MyEmitter.emit("progress", processPercentage);
        if (processPercentage == 100) {
          console.log(`Total ${processedFiles} files processed`);
          console.log(
            `Total ${process.memoryUsage.rss() / 1024 / 1024} MB memory used`
          );
          totalFiles = 0;
          processedFiles = 0;
          processPercentage = 0;
          memoryConsuption = process.memoryUsage.rss() / 1024 / 1024;
        };
      }
    } catch (error) {
      throw error;
    }
  }

  getProgress() {
    return processPercentage;
  }

  getLogs() {
    return logs;
  }
}
module.exports = new Nano();
