const router = require('express').Router();
const Photo = require('../db').import('../models/photo');
const multer = require('multer');
const path = require('path');
const validateSession = require('../middleware/validate-session');

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

let upload = multer({ storage: storage, fileSize: 100000000 });

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
            res.sendFile(path.resolve('./' + foundPhoto.path))
        })
        .catch(err => {
            res.status(500).json(err);
        })
});

router.post('/upload', validateSession, upload.single('photo'), (req, res) => { //POST user uploads a single photo
    options = { multi: true };
    Photo.create({
        path: req.file.path,
        user_id: req.user.id,
        caption: req.body.caption,
        username: req.user.username
    })
        .then(successPhoto => res.status(200).json({ successPhoto }))
        .catch(err => res.status(500).json({ error: err }))
});

router.put('/:id', validateSession, upload.single('photo'), (req, res) => { //PUT user updates a single photo
    Photo.update({
        path: req.file.path,
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