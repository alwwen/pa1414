const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const sequelize = new Sequelize ({
    dialect: 'sqlite',
    storage: './database.sqlite'
})
var db = {}

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
                allowNull: false
            }
        });
        db.Boxes = sequelize.define('Boxes', {
            text: {
                type: DataTypes.STRING,
                allowNull: false
            },
        });
        await sequelize.sync({ force: true });
        await db.Boxes.create({ text: "Box-1"});
        await db.Boxes.create({ text: "Box-2"});
        await db.Boxes.create({ text: "Box-3"});
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

                res.json({ token });
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


        app.listen(port, () => {
            console.log(`App listening on port ${port}`) 
        })
    } catch (error) {
        console.error(error);
    }
}
startServer()