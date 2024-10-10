const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // use false for STARTTLS; true for SSL on port 465
    auth: {
      user: 'pa1414moveout@gmail.com',
      pass: 'btbvqtqttazvlyfb',
    }
  });

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

async function calculateStorage(boxes) {
    let totalSize = 0;

    // Iterate over each box
    for (const box of boxes) {
        if (box.filePath) {
            const filePath = "/home/alexanderw/pa1414/frontend/src/form_data/" + box.filePath; // Adjust this path as necessary
            try {
                // Use fs.statSync to get the file stats
                const stats = fs.statSync(filePath);
                totalSize += stats.size; // Add file size to total
            } catch (error) {
                console.error(`Could not get size for file ${filePath}:`, error);
            }

        }
    }

    return totalSize; // Return the total size in bytes
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

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
            },
            lastLogin: {
                type: DataTypes.DATE,
                allowNull: true
            },
            verify_token: {
                type: DataTypes.STRING,
                allowNull: true
            },
            role: {
                type: DataTypes.STRING,
                allowNull: false,
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
            },
            public: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            access_code: {
                type: DataTypes.STRING,
                allowNull: true
            }
        });
        await sequelize.sync();
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
        console.log(process.env.GOOGLE_MAIL_APP_PASS);
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
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let token = '';
                for (let i = 0; i < 6; i++) {
                    token += chars.charAt(Math.floor(Math.random() * chars.length));
                }

                // Hash the password before saving the user
                const hashedPassword = await bcrypt.hash(password, 10);

                // Create and save the user
                const user = await db.User.create({
                    email,
                    password: hashedPassword,
                    verify_token: token,
                    role: 'user'
                });

                const mailOptions = {
                    from: '"Alexander Winblad" <pa1414moveout@gmail.com>', // sender address
                    to: email, // list of receivers
                    subject: "Verify your email", // Subject line
                    html: `
                    <h1>Welcome to Our Platform!</h1>
                    <p>Hi there,</p>
                    <p>Thank you for registering with us! We're excited to have you on board.</p>
                    <p>To complete your registration, please verify your email address by using the verification token sent to you.</p>
                    <p><strong>Your Verification Token: ${token}</strong></p>
                    <p>Simply enter the token in the verification page to activate your account and gain full access to our services.</p>
                    <p>If you did not sign up for this account, please disregard this email.</p>
                    <p>We're here to help if you need any assistance.</p>
                    <p>Best regards,</p>
                    <p>The MoveOut Team</p>
                    `,
                };
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        console.log('Error:', error);
                    } else {
                        console.log('Email sent: ', info.response);
                    }
                });

                res.status(201).json({ id: user.id, email: user.email });
            } catch (error) {
                console.log("WTF!?");
                res.status(500).json({ message: 'Error registering user', error });
            }
        });

        app.post('/verify', async (req, res) => {
            const { email, token } = req.body;
        
            try {
                // Find the user by email and verification token
                const user = await db.User.findOne({ where: { email, verify_token: token } });
                if (!user) {
                    return res.status(400).json({ message: 'Invalid token or email' });
                }
        
                // Mark the user as verified (remove the token and set verified flag)
                await db.User.update(
                    { verify_token: null, verified: true },  // Clear token and set user as verified
                    { where: { id: user.id } }
                );
        
                res.status(200).json({ message: 'Account verified successfully' });
            } catch (error) {
                res.status(500).json({ message: 'Error verifying account', error });
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

                const validated = user.verified;

                if (!validated) {
                    return res.status(400).json({ message: 'Account not verified' });
                }

                // Update the last_login_date field to the current date
                const currentDate = new Date().toISOString(); // YYYY-MM-DD format

                await db.User.update(
                    { last_login_date: currentDate, inactive: false },
                    { where: { id: user.id } }
                );

                // Generate JWT token
                const token = jwt.sign({ id: user.id, username: user.email }, process.env.JWT_SECRET, {
                    expiresIn: '1h',
                });

                res.json({ token: token, email: user.email, role: user.role });
            } catch (error) {
                res.status(500).json({ message: 'Error logging in', error });
            }
        });

        app.get('/users', async (req, res) => {
            try {
                // Fetch all users
                const users = await db.User.findAll({
                    attributes: ['id', 'email', 'role', 'lastLogin', 'inactive'] // Select specific attributes
                });
        
                // Prepare a response object
                const userData = await Promise.all(users.map(async (user) => {
                    // Fetch boxes for the current user based on the user's email
                    const boxes = await db.Boxes.findAll({
                        attributes: ['filePath'],
                        where: { email: user.email } // Get boxes belonging to the user
                    });
        
                    // Calculate total storage used for the user's boxes
                    const storageUsed = await calculateStorage(boxes);
        
                    return {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                        lastLogin: user.lastLogin,
                        inactive: user.inactive,
                        storageUsed: formatBytes(storageUsed), // Use formatted size
                    };
                }));
        
                res.json(userData);
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Error fetching users' });
            }
        });

        
        app.delete('/delete-account', async (req, res) => {
            const { email } = req.body; // Get email from the request body
        
            try {
                // Check if the user exists before deleting
                const existingUser = await db.User.findOne({ where: { email } });
                if (!existingUser) {
                    return res.status(404).json({ message: 'User not found' });
                }
        
                // Delete the user by email
                await db.User.destroy({
                    where: { email },
                });
        
                return res.status(204).send(); // No content
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Error deleting account' });
            }
        });
        
        // Set Inactive Route
        app.patch('/set-inactive', async (req, res) => {
            const { email } = req.body; // Get email from the request body
        
            try {
                // Check if the user exists before updating
                const existingUser = await db.User.findOne({ where: { email } });
                if (!existingUser) {
                    return res.status(404).json({ message: 'User not found' });
                }
        
                // Set the user's status to inactive
                await db.User.update(
                    { active: false }, // Assuming there is an 'active' field
                    { where: { email } }
                );
        
                return res.status(200).json({ message: 'Account set to inactive' });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Error setting account to inactive' });
            }
        });

        app.post('/check-user', async (req, res) => {
            const { email } = req.body;
        
            try {
                const existingUser = await db.User.findOne({ where: { email } });
                console.log('Existing user:', existingUser);
                let role = existingUser?.role;
                if (!existingUser) {
                    console.log("HEEERE");
                    const currentDate = new Date().toISOString();
                    role = 'admin'
                    const user = await db.User.create({
                        email,
                        password: null,
                        verified: true,
                        lastLogin: currentDate,
                        role: role
                    });
                }
                return res.status(200).json({ message: 'User exists', role: role, email: email });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Error checking user' });
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
            const { email, title, type, public } = req.body;
            console.log('Test 1:', req.file);
            console.log('Test 2:', req.body);
            let access_token = '';
            // The file should now be saved by multer in the 'form_data' folder
            if (!req.file) {
              return res.status(400).json({ message: 'No file uploaded' });
            }
            let publiic = false;
            if (public === 'true') {
                publiic = true;
            }
            if (!publiic) {
                const chars = '0123456789';
                console.log("HEJ");
                access_token = '';
                for (let i = 0; i < 6; i++) {
                    access_token += chars.charAt(Math.floor(Math.random() * chars.length));
                }
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
              publiic,
              access_code: access_token
            });
            console.log(access_token);
            
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
              public,
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

        app.get('/mail/test', async (req, res) => {
            try {
                const mailOptions = {
                    from: '"Alexander Winblad" <pa1414moveout@gmail.com>', // sender address
                    to: "alwi12399@gmail.com", // list of receivers
                    subject: "Tjena Tjena", // Subject line
                    text: "WTF", // plain text body
                    html: "<b>Hello world?</b>", // html body
                };
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log('Error:', error);
                    } else {
                      console.log('Email sent: ', info.response);
                    }
                  });
                res.send('Mail sent');
            } catch (error) {
                console.error(error);
                res.send('Error sending mail');
            }
            
        });

        app.post('/share', async (req, res) => {
            const { email, url, access_code } = req.body;
            const mailOptions = {
                from: '"Alexander Winblad" <pa1414moveout@gmail.com>', // sender address
                to: email, // list of receivers
                subject: "Box sharing", // Subject line
                html: `
                <h1>Someone wants to share their box with you!</h1>
                <p>Hi there,</p>
                <p>You have been invited to access a box on MoveOut. Click the link below to access the box with the code.</p>
                <p><a href="${url}">Access Box</a></p>
                <p>Access Code: ${access_code}</p>
                <p>Best regards,</p>
                <p>The MoveOut Team</p>
                `,
            };
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log('Error:', error);
                } else {
                    console.log('Email sent: ', info.response);
                }
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