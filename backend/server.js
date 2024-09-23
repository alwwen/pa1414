const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const sequelize = new Sequelize ({
    dialect: 'sqlite',
    storage: './database.sqlite'
})
var db = {}

async function setupDB() {
    try {
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
        })



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