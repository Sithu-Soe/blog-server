const {CustomAPIError} = require('../errors/custom-error')

const errorHandlerMiddleware = async (err, req, res, next) => {
    if(err instanceof CustomAPIError) return res.status(err.statusCode).json({message: err.message})
    if(req.route?.path === '/:id' && req.method === 'GET') return res.status(404).json({message: 'Invalid ID'});
    console.log('ERROR HANDLER',err.name)
    if(err.name === 'BSONTypeError') return res.status(404).json({message: 'Please provide valid ID', err: err.message});

    return res.status(500).json({msg: err.message})
}

module.exports = errorHandlerMiddleware