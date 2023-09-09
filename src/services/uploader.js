import multer from "multer";
import __dirname from "../utils.js"

//¿Donde voy a almacenar TODO?

const storage = multer.diskStorage({
  destination: function(req,file,cb){     //Carpeta donde se van a guardar las imagenes
    cb(null,`${__dirname}/public/images`)
  },
  filename: function(req,file,cb){        //Como se va a guardar el nombre del archivo
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

const uploader = multer({storage});

export default uploader;