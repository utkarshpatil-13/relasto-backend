import multer from 'multer'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })

  // diskstorage accepts two things - 1. destination path 2. filename
  
export const upload = multer(
    { 
        storage: storage 
    }
)