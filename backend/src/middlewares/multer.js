import multer from 'multer';
import os from 'os';

// Temporary local destination for files prior to processing
const upload = multer({ dest: os.tmpdir() });
export default upload;