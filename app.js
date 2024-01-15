import express from "express";
import fs from "fs";
const app = express();
import path from "path";
import cors from "cors";

//SERVER
app.listen(3000, () => {
    console.log("Server listening on Port 3000");
});

app.use(
    cors({
        origin: "*",
    })
);
app.use(express.json());

const actorProperties = ["name", "surname", "age", "movie"];

//Functions

const readResource = () => {
    const data = fs.readFileSync(
        path.resolve("./database/actors.json"),
        "utf-8"
    );
    const resource = JSON.parse(data);
    return resource;
};

const getResourceById = (req, res) => {
    const { id } = req.params;
    const actors = readResource();
    let resourceIndex;
    for (let i = 0; i < actors.length; i++) {
        const element = actors[i];
        console.log("element " + element);

        if (Number(element.id) === Number(id)) {
            resourceIndex = i;
            break;
        }
    }
    if (resourceIndex === undefined) {
        res.status(404).send(`There is no actor resource with ID ${id}`);
        return [];
    }

    return [actors[resourceIndex], resourceIndex];
};

const generateId = () => {
    const resource = readResource();
    const ids = resource.map((actor) => actor.id);
    for (let i = 0; i <= ids.length; i++) {
        if (!ids.includes(i)) {
            return i;
        }
    }
};

const writeResource = (resource) => {
    const data = JSON.stringify(resource);
    fs.writeFileSync(path.resolve("./database/actors.json"), data);
};

//GET actors
app.get("/actors", (req, res) => {
    res.sendFile(path.resolve("./database/actors.json"));
});

//GET actors/:id
app.get("/actors/:id", (req, res) => {
    const [actor] = getResourceById(req, res);
    res.send(actor);
});

//POST actors
app.post("/actors", (req, res) => {
    const newActor = req.body;
    const isActorValid = Object.keys(newActor).length === 4;
    const actorPropertyValid = actorProperties.every(
        (key) => newActor[key] !== undefined
    );

    if (isActorValid && actorPropertyValid) {
        const actors = readResource();
        newActor.id = generateId();
        actors.push(newActor);
        writeResource(actors);
        res.send(newActor);
    } else {
        res.status(400).send(
            `books must have 4 properties: ${actorProperties}`
        );
    }
});

//PUT actors/:id
app.put("/actors/:id", (req, res) => {
    const actorToUpdate = req.body;
    const isActorValid = Object.keys(actorToUpdate).length <= 3;
    const actorPropertyValid = actorProperties.every(
        (key) => actorToUpdate[key] !== undefined
    );

    if (isActorValid && actorPropertyValid) {
        const [, indexToUpdate] = getResourceById(req, res);
        const actors = readResource();
        actorToUpdate.id = req.params.id;
        actors[indexToUpdate] = actorToUpdate;
        writeResource(actors);
        res.send(actorToUpdate);
    } else {
        res.status(400).send(
            `books must have 4 properties: ${actorProperties}`
        );
    }
});

//PATCH actors/:id

app.patch("/actors/:id", (req, res) => {
    const actorToUpdate = req.body;
    const isActorValid = Object.keys(actorToUpdate).length;
    if (isActorValid > 3) {
        res.status(400).send(`Properties must have less than 3 properties `);
    }
    let isPropertiesValid = true;
    Object.keys(actorToUpdate).forEach((key) => {
        isPropertiesValid &= actorProperties.includes(key);
    });

    if (isActorValid && isPropertiesValid) {
        const [, indexToUpdate] = getResourceById(req, res);
        const actors = readResource();
        actors[indexToUpdate] = { ...actors[indexToUpdate], ...actorToUpdate };
        writeResource(actors);
        res.send(actors[indexToUpdate]);
    } else {
        res.status(400).send(
            `books must have 4 properties: ${actorProperties}`
        );
    }
});

//DELETE authors/:id
app.delete("/actors/:id", (req, res) => {
    const actors = readResource();
    const [, indexToDelete] = getResourceById(req, res);
    actors.splice(indexToDelete, 1);
    writeResource(actors);
    res.send(actors);
});
