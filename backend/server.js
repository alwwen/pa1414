const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');

dotenv.config();
const sequelize = new Sequelize ({
    dialect: 'sqlite',
    storage: './database.sqlite'
})
var db = {}

const uploadDirectory = "/home/alexanderw/pa1414/frontend/src/form_data";
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

const qrCodeDir = "/home/alexanderw/pa1414/frontend/src/qr_codes"; // Adjust the path as necessary
if (!fs.existsSync(qrCodeDir)){
    fs.mkdirSync(qrCodeDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory); // Directory where files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, req.body.filename); // Use the original name of the file
  },
});

const upload = multer({ storage });

async function setupDB() {
    try {
        db.User = sequelize.define('User', {
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            password: {
                type: DataTypes.STRING,
                allowNull: true
            },
            verified: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            inactive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        });
        db.Boxes = sequelize.define('Boxes', {
            title: {
                type: DataTypes.STRING,
                allowNull: false
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false
            },
            filePath: {
                type: DataTypes.STRING,
                allowNull: false
            },
            qrCode: {
                type: DataTypes.STRING,
                allowNull: false
            }
        });
        await sequelize.sync({ force: true });
        // await db.Boxes.create({ text: "Box-1"});
        // await db.Boxes.create({ text: "Box-2"});
        // await db.Boxes.create({ text: "Box-3"});
        console.log("Database setup complete.");
    } catch (error) {
        console.error(error);
    }
}

function auth(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(400).json({ message: 'Invalid token.' });
    }
}


async function startServer() {
    try {
        await setupDB()
        const port = 3001
        const express = require('express')
        const app = express()
        app.use(cors());
        app.use(express.json())
        app.get('/', (req, res) => {
            res.send('hello world')
        });

        app.post('/register', async (req, res) => {
            const { email, password } = req.body;

            try {
                // Check if the user already exists
                const existingUser = await db.User.findOne({ where: { email } });
                if (existingUser) {
                    return res.status(400).json({ message: 'User already exists' });
                }

                // Hash the password before saving the user
                const hashedPassword = await bcrypt.hash(password, 10);

                // Create and save the user
                const user = await db.User.create({
                    email,
                    password: hashedPassword
                });

                res.status(201).json({ id: user.id, email: user.email });
            } catch (error) {
                res.status(500).json({ message: 'Error registering user', error });
            }
        });

        // User login
        app.post('/login', async (req, res) => {
            const { email, password } = req.body;

            try {
                // Find the user by username
                const user = await db.User.findOne({ where: { email } });
                if (!user) {
                    return res.status(400).json({ message: 'Invalid username or password' });
                }

                // Compare passwords
                const validPassword = await bcrypt.compare(password, user.password);
                if (!validPassword) {
                    return res.status(400).json({ message: 'Invalid username or password' });
                }

                // Generate JWT token
                const token = jwt.sign({ id: user.id, username: user.email }, process.env.JWT_SECRET, {
                    expiresIn: '1h',
                });

                res.json({ token: token, email: user.email });
            } catch (error) {
                res.status(500).json({ message: 'Error logging in', error });
            }
        });



        // GET METHOD API URL | RETRIEVE ITEMS
        app.get('/api/boxes', (req, res) => {
            // return all taskls
            db.Boxes.findAll().then(boxes => {
                res.json(boxes)
            })
        })
        // POST METHOD API URL | CREATE ITEM
        // app.post('/api/boxes', (req, res) => {
        //     // create a task
        //     db.Task.create(req.body).then( t => {
        //         res.json(t)
        //     }) 
        // })



        // DELETE METHOD API URL | DELETE ITEM
        app.delete('/api/boxes/:id', (req, res) => {
            // delete a task
            db.Boxes.destroy({
                where: {
                    id: req.params.id
                }
            }).then(() => {
                res.sendStatus(204);
            }).catch((error) => {
                console.error(error);
                res.sendStatus(500); // Internal Server Error
            });
        });

        app.post('/api/boxes', upload.single('fileContent'), async (req, res) => {
          try {
            const { email, title, type } = req.body;
            console.log('Test 1:', req.file);
            console.log('Test 2:', req.body);
        
            // The file should now be saved by multer in the 'form_data' folder
            if (!req.file) {
              return res.status(400).json({ message: 'No file uploaded' });
            }
            
            const filePath = req.file.filename;
            console.log('File uploaded:', filePath);
            
            // Create the box in the database
            const box = await db.Boxes.create({
              email,
              title,
              type,
              filePath,
              qrCode: '', // Initially empty, will update it later
            });
            
            // Generate the QR code with the link
            const qrCodeURL = `http://localhost:3000/my-boxes/${box.id}`;
            const qrCodePath = path.join(qrCodeDir, `${box.id}_qr.png`);
        
            // Generate QR code and save it
            await QRCode.toFile(qrCodePath, qrCodeURL);
            
            // Update the box with the QR code path
            box.qrCode = qrCodePath; // or you can save just the filename if you prefer
            await box.save();
        
            // Send back a success response with file path and user data
            res.status(200).json({
              message: 'Box created successfully',
              email,
              link: filePath, // File path saved on the server
              type,
              title,
              qrCode: qrCodePath, // Include the QR code path in the response
            });
          } catch (error) {
            console.error('Error uploading file:', error);
            res.status(500).json({ message: 'Error uploading file', error });
          }
        });

        app.get('/api/boxes/:id', async (req, res) => {
          try {
            const box = await db.Boxes.findByPk(req.params.id); // Fetch by primary key
            if (box) {
              res.json(box);
            } else {
              res.status(404).json({ message: 'Box not found' });
            }
          } catch (error) {
            console.error('Error fetching box:', error);
            res.status(500).json({ message: 'Error fetching box' });
          }
        });

        app.get('/api/list', (req, res) => {
          const filePath = req.query.path; // Get file path from query parameter
          fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
              return res.status(500).json({ error: 'Error reading file' });
            }
            res.send(data);
          });
        });


        app.listen(port, () => {
            console.log(`App listening on port ${port}`) 
        })
    } catch (error) {
        console.error(error);
    }
}
startServer()