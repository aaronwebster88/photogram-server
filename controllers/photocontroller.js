const router = require('express').Router();
const Photo = require('../db').import('../models/photo');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const validateSession = require('../middleware/validate-session');

let s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION
});

let upload = multer({ 
    storage: multerS3({
        s3: s3,
        bucket: 'photogram-bucket',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, Date.now() + '-' + file.originalname)
        }
    }), 
    // fileSize: 100000000 
});

// router.get('/', (req, res) => { //TESTING OVERALL ENDPOINT
//     res.json({ message: "TEST IS GOOOOOOOOOD" })
// });

router.get('/allphotos', (req, res) => { // GET All photos on site
    Photo.findAll({
        order: [['id', 'DESC']]
    })
        .then(photos => {
            res.status(200).json({ photos })
        })
        .catch(err => res.status(500).json({ error: err }));
});

router.get('/myphotos', validateSession, (req, res) => { // GET all current users photos
    Photo.findAll({
        where: {user_id: req.user.id}, order: [['id', 'DESC']]
    })
    .then(
        getSuccess = photos => {
            res.status(200).json({ userPhotos: photos })
        },
        getError = err => {
            res.status(500).json({ error: err })
        }
    )
});

router.get('/:id', (req, res) => { // GET for serving photos by ID
    Photo.findOne({
        where: { id: req.params.id, }
    })
        .then(foundPhoto => {
            res.status(200).json(foundPhoto);
        })
        .catch(err => {
            res.status(500).json(err);
        })
});

router.post('/upload', validateSession, upload.single('photo'), (req, res) => { //POST user uploads a single photo
    console.log('inside POST method');
    options = { multi: true };
    Photo.create({
        path: req.file.location,
        user_id: req.user.id,
        caption: req.body.caption,
        username: req.user.username
    })
        .then(successPhoto => res.status(200).json({ successPhoto }))
        .catch(err => res.status(500).json({ error: err }))
});

router.put('/:id', validateSession, upload.single('photo'), (req, res) => { //PUT user updates a single photo
    Photo.update({
        path: req.file.location,
        caption: req.body.caption
    },
        {
            where: {
                user_id: req.user.id,
                id: req.params.id
            }
        })
        .then(recordsChanged => {
            res.status(200).json(`${recordsChanged} records updated.`);
        })
        .catch(err => res.status(500).json({ error: err }));
});

router.delete('/:id', validateSession, (req, res) => { //DELETE user deletes single photo
    Photo.destroy({
        where: {
            id: req.params.id,
            user_id: req.user.id
        }
    })
        .then(recordsChanged => {
            res.status(200).json(`${recordsChanged} records deleted.`)
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
});


module.exports = router;