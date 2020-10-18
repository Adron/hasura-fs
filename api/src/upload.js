const common = require('./common');
const api = require('./api');

exports.handler = (fs) => (req, res) => {
  const { file_id } = req.params;

  return api.getFile(req.headers.authorization, file_id)
    .then(common.isFileWithState('Upload', 'uploading'))
    .then((data) => {
      const pipe = fs.uploadToBlob(data.owner_id, file_id)

      return pipe(req);
    })
    .catch((err) => {
      if (err.code) {
        console.error(err.message)
        res.status(err.code).send({err: err.message})
        return
      }

      console.error(err)
      res.status(500).send({err: 'Internal error'})
      return api.updateFileState(file_id, 'error')
    })
    .then(() => res.end())
    .then(() => api.setFileAsReadyWithSize(file_id, req.headers['content-length']))
    .catch((err) => {
      console.error(err)
    })
};
