module.exports.APP_NAME_EN = "Bleane";

module.exports.APP_NAME_AR = "Bleane";

module.exports.APP_EMAIL = "bleaneltd@gmail.com";

module.exports.SUPPORT_EMAIL = "team@bleane.online";

module.exports.PORT = process.env["PORT"] || 4000;

module.exports.DATABASE_NAME = "bleane";

module.exports.DATABASE_URI =
  process.env["MONGODB_URI"] ||
  `mongodb://127.0.0.1:27017/${this.DATABASE_NAME}`;

module.exports.PROJECT_ID = "fast-go-2023";

module.exports.BUCKET_NAME = "fast-go-bucket";

module.exports.MAX_FILE_UPLOAD_SIZE = 5; // In MegaBytes

module.exports.MAX_REQ_BODY_SIZE = 8; // In KiloBytes

module.exports.SUPPORTED_LANGUAGES = ["en", "ar"];

module.exports.SUPPORTED_PHOTO_EXTENSIONS = [
  "jpg",
  "png",
  "jpeg",
  "webp",
  "tiff",
  "raw",
];

module.exports.SUPPORTED_VIDEO_EXTENSIONS = [
  "mp4",
  "mpeg",
  "mpeg4",
  "avi",
  "mov",
  "wmv",
  "flv",
  "mkv",
];

module.exports.MAX_REQUESTS = {
  PER_MILLISECONDS: 1000, //  => 1 second
  NUMBER: 256, // allowed number of requests
};

module.exports.PASSWORD_SALT = process.env["PASSWORD_SALT"];
