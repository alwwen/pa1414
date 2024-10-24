const { Sequelize, DataTypes, Op } = require('sequelize');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const nodemailer = require("nodemailer");
const { createCanvas, loadImage } = require('canvas');


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'pa1414moveout@gmail.com',
      pass: 'anfdhibaozqhieot',
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

const qrCodeDir = "/home/alexanderw/pa1414/frontend/src/qr_codes"; 
if (!fs.existsSync(qrCodeDir)){
    fs.mkdirSync(qrCodeDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory); 
  },
  filename: (req, file, cb) => {
    const originalFilename = file.originalname;
    const customFilename = req.body.filename || originalFilename; 
    
    
    
    cb(null, customFilename); 
  },
});

async function calculateStorage(boxes) {
    let totalSize = 0;

    
    for (const box of boxes) {
        if (box.filePath) {
            const filePath = "/home/alexanderw/pa1414/frontend/src/form_data/" + box.filePath; 
            try {
                
                const stats = fs.statSync(filePath);
                totalSize += stats.size; 
            } catch (error) {
                console.error(`Could not get size for file ${filePath}:`, error);
            }

        }
    }

    return totalSize; 
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
        app.use(express.urlencoded({ extended: true }));
        app.get('/', (req, res) => {
            res.send('hello world')
        });

        app.post('/register', async (req, res) => {
            const { email, password } = req.body;

            try {
                
                const existingUser = await db.User.findOne({ where: { email } });
                if (existingUser) {
                    return res.status(400).json({ message: 'User already exists' });
                }
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let token = '';
                for (let i = 0; i < 6; i++) {
                    token += chars.charAt(Math.floor(Math.random() * chars.length));
                }

                
                const hashedPassword = await bcrypt.hash(password, 10);

                
                const user = await db.User.create({
                    email,
                    password: hashedPassword,
                    verify_token: token,
                    role: 'user'
                });

                const mailOptions = {
                    from: '"Alexander Winblad" <pa1414moveout@gmail.com>', 
                    to: email, 
                    subject: "Verify your email", 
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
                        
                    } else {
                        
                    }
                });

                res.status(201).json({ id: user.id, email: user.email });
            } catch (error) {
                
                res.status(500).json({ message: 'Error registering user', error });
            }
        });

        app.post('/verify', async (req, res) => {
            const { email, token } = req.body;
        
            try {
                
                const test_user = await db.User.findOne({ where: { email } });
                
                const user = await db.User.findOne({ where: { email, verify_token: token } });
                if (!user) {
                    return res.status(400).json({ message: 'Invalid token or email' });
                }
        
                
                await db.User.update(
                    { verify_token: null, verified: true },  
                    { where: { id: user.id } }
                );
        
                res.status(200).json({ message: 'Account verified successfully' });
            } catch (error) {
                res.status(500).json({ message: 'Error verifying account', error });
            }
        });
        

        
        app.post('/login', async (req, res) => {
            const { email, password } = req.body;

            try {
                
                
                const user = await db.User.findOne({ where: { email } });
                if (!user) {
                    return res.status(400).json({ message: 'Invalid username or password' });
                }
                
                
                const validPassword = await bcrypt.compare(password, user.password);
                if (!validPassword) {
                    return res.status(400).json({ message: 'Invalid username or password' });
                }
                
                const validated = user.verified;

                if (!validated) {
                    return res.status(400).json({ message: 'Account not verified' });
                }
                
                
                const currentDate = new Date().toISOString(); 

                await db.User.update(
                    { lastLogin: currentDate, inactive: false },
                    { where: { id: user.id } }
                );
                
                
                const token = jwt.sign({ id: user.id, username: user.email }, process.env.JWT_SECRET, {
                    expiresIn: '1h',
                });
                
                res.json({ token: token, email: user.email, role: user.role });
            } catch (error) {
                res.status(500).json({ message: 'Error logging in', error });
            }
        });

        app.get('/users', auth, async (req, res) => {
            try {
                
                const users = await db.User.findAll({
                    attributes: ['id', 'email', 'role', 'lastLogin', 'inactive'] 
                });
        
                
                const userData = await Promise.all(users.map(async (user) => {
                    
                    const boxes = await db.Boxes.findAll({
                        attributes: ['filePath'],
                        where: { email: user.email } 
                    });
        
                    
                    const storageUsed = await calculateStorage(boxes);
        
                    return {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                        lastLogin: user.lastLogin,
                        inactive: user.inactive,
                        storageUsed: formatBytes(storageUsed), 
                    };
                }));
        
                res.json(userData);
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Error fetching users' });
            }
        });

        
        app.delete('/delete-account', async (req, res) => {
            const { email } = req.body; 
        
            try {
                
                const existingUser = await db.User.findOne({ where: { email } });
                if (!existingUser) {
                    return res.status(404).json({ message: 'User not found' });
                }
        
                
                await db.User.destroy({
                    where: { email },
                });
        
                return res.status(204).send(); 
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Error deleting account' });
            }
        });
        
        
        app.patch('/set-inactive', async (req, res) => {
            const { email } = req.body; 
        
            try {
                
                const existingUser = await db.User.findOne({ where: { email } });
                if (!existingUser) {
                    return res.status(404).json({ message: 'User not found' });
                }
        
                
                await db.User.update(
                    { active: false }, 
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
                
                let role = existingUser?.role;
                let token = "";
                const currentDate = new Date().toISOString();
                if (!existingUser) {
                    
                    role = 'user';
                    const user = await db.User.create({
                        email,
                        password: null,
                        verified: true,
                        lastLogin: currentDate,
                        role: role
                    });
                    token = jwt.sign({ id: user.id, username: user.email }, process.env.JWT_SECRET, {
                        expiresIn: '1h',
                    });
                } else {
                    await db.User.update(
                        { lastLogin: currentDate, inactive: false },
                        { where: { id: existingUser.id } }
                    );
                    token = jwt.sign({ id: existingUser.id, username: existingUser.email }, process.env.JWT_SECRET, {
                        expiresIn: '1h',
                    });
                }

                
                return res.status(200).json({ message: 'User exists', role: role, email: email, token: token });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Error checking user' });
            }
        });


        
        app.get('/api/boxes', auth, (req, res) => {
            const userEmail = req.headers['user-email']; 
            const userRole = req.headers['user-role'];   
        
            if (!userEmail || !userRole) {
                return res.status(400).json({ error: 'Missing email or role in headers' });
            }
        
            
            if (userRole === 'admin') {
                db.Boxes.findAll({
                    where: {
                        [Op.or]: [
                            { public: true },
                            { email: userEmail }
                        ]
                    }
                })
                    .then(boxes => res.json(boxes))
                    .catch(err => res.status(500).json({ error: 'Error fetching boxes' }));
            } else {
                
                db.Boxes.findAll({
                    where: { email: userEmail }  
                })
                .then(boxes => res.json(boxes))
                .catch(err => res.status(500).json({ error: 'Error fetching boxes' }));
            }
        });
        
        
        
        
        
        
        

        app.post('/api/boxes-update/:id', upload.single('fileContent'), async (req, res) => {
            try {
              const { title, type, filename } = req.body;
              if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
              }

              const box = await db.Boxes.findByPk(req.params.id);
              
              if (!box) {
                return res.status(404).json({ message: 'Box not found' });
              }
          
              console.log(title);
              box.title = title;
              box.type = type;
                box.filePath = filename;
          
              await box.save(); 
              res.status(200).json(box); 
            } catch (error) {
              console.error('Error updating box:', error);
              res.status(500).json({ message: 'Error updating box' });
            }
          });
          



        
        app.delete('/api/boxes/:id', auth, (req, res) => {
            
            db.Boxes.destroy({
                where: {
                    id: req.params.id
                }
            }).then(() => {
                res.sendStatus(204);
            }).catch((error) => {
                console.error(error);
                res.sendStatus(500); 
            });
        });

        app.post('/api/boxes', auth, upload.single('fileContent'), async (req, res) => {
          try {
            const { email, title, type, public, label, content } = req.body;
            
            
            let access_token = '';
            
            if (!req.file) {
              return res.status(400).json({ message: 'No file uploaded' });
            }
            let publiic = false;
            if (public === 'true') {
                publiic = true;
            }
            if (!publiic) {
                const chars = '0123456789';
                
                access_token = '';
                for (let i = 0; i < 6; i++) {
                    access_token += chars.charAt(Math.floor(Math.random() * chars.length));
                }
            }
            
            const filePath = req.file.filename;
            
            
            
            const box = await db.Boxes.create({
              email,
              title,
              type,
              filePath,
              qrCode: '', 
              publiic,
              access_code: access_token
            });
            
            
            
            const qrCodeURL = `http://localhost:3000/my-boxes/${box.id}`;
            const qrCodePath = path.join(qrCodeDir, `${box.id}_qr.png`);

            const backgroundImage = await loadImage(`./../frontend/src/assets/${label}`);

            
            const canvas = createCanvas(1301, 574);
            const ctx = canvas.getContext('2d');

            
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

            
            ctx.font = '48px Arial';
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'center';
            ctx.fillText(box.title, canvas.width / 2, 50); 

            
            const qrCodeDataUrl = await QRCode.toDataURL(qrCodeURL, {
                width: 150,
                margin: 1,
            });

            
            const qrCodeImage = await loadImage(qrCodeDataUrl);

            
            const qrCodeSize = 300; 
            ctx.drawImage(qrCodeImage, (canvas.width - qrCodeSize) / 2, 250, qrCodeSize, qrCodeSize); 
            
            const warningSize = 90;
            const warningImage = await loadImage(`./../frontend/src/assets/${content}`);
            ctx.drawImage(warningImage, 30, 400, warningSize, warningSize);
            
            const finalImagePath = path.join(qrCodeDir, `${box.id}_label.png`);
            const out = fs.createWriteStream(finalImagePath);
            const stream = canvas.createPNGStream();
            stream.pipe(out);

            out.on('finish', () => {
                
            });
        
            
            await QRCode.toFile(qrCodePath, qrCodeURL);
            
            
            box.qrCode = qrCodePath; 
            await box.save();
        
            
            res.status(200).json({
              message: 'Box created successfully',
              email,
              link: filePath, 
              type,
              title,
              qrCode: qrCodePath, 
              public,
            });
          } catch (error) {
            console.error('Error uploading file:', error);
            res.status(500).json({ message: 'Error uploading file', error });
          }
        });

        app.get('/api/boxes/:id', async (req, res) => {
          try {
            const box = await db.Boxes.findByPk(req.params.id); 
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
          const filePath = req.query.path; 
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
                    from: '"Alexander Winblad" <pa1414moveout@gmail.com>', 
                    to: "alwi12399@gmail.com", 
                    subject: "Tjena Tjena", 
                    text: "WTF", 
                    html: "<b>Hello world?</b>", 
                };
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      
                    } else {
                      
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
                from: '"Alexander Winblad" <pa1414moveout@gmail.com>', 
                to: email, 
                subject: "Box sharing", 
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
                    
                } else {
                    
                }
            });
        });

        
        app.post('/mail/all', auth, async (req, res) => {
            const { emailContent, emails } = req.body;         
            try {
                
                for (const email of emails) {
                    await transporter.sendMail({
                        from: '"Alexander Winblad" <pa1414moveout@gmail.com>',
                        to: email,
                        subject: 'Message from Admin',
                        text: emailContent,  
                    });
                }

                res.status(200).json({ message: 'Emails sent successfully.' });
            } catch (error) {
                console.error('Error sending emails:', error);
                res.status(500).json({ error: 'Failed to send emails.' });
            }
        });


        app.listen(port, () => {
            console.log("Server is running on port " + port)
        })
    } catch (error) {
        console.error(error);
    }
}
startServer()