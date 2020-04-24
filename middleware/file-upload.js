const multer = require('multer');
const uuid = require('uuid/v1');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
};

const fileUpload = multer({
  limits: 500000,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      console.log('========= MULTER DESTINATION =================');
      cb(null, 'uploads/images');
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      console.log('========= MULTER FILENAME =================');
      console.log(etx);
      cb(null, uuid() + '.' + ext);
    },
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error('Invalid mime type');

    console.log('========= MULTER FILEFILTER =================');
    console.log(error);
    cb(error, isValid);
  },
});

module.exports = fileUpload;
