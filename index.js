const { users } = require('./users');
const fs = require('fs');
const express = require('express');
const app = express();
app.use(express.json());
const port = 3000;

//Get list of all users
app.get('/users', (req, res) => {
    res.send(users)
})

//Get a user by passing id
app.get('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);
    if (user) {
        res.send(user)
    }
    else {
        res.status(404).send({ message: 'User not found' })
    }
})

//Insert a new user 
app.post('/users/new', (req, res) => {
    const newUser = req.body;
    console.log(newUser)
    const newUserId = users.length > 0 ? (users[(users.length - 1)].id + 1) : 1;
    newUser.id = newUserId;
    console.log(newUser.id)
    if (!newUser.name || !newUser.email || !newUser.phone_number) {
        return res.status(400).send({ message: "All fields (name, email, phone_number) are required" });
    }
    const newUserWithId = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone_number: newUser.phone_number
    };

    users.push(newUserWithId);
    res.send({
        message: "New user inserted successfully",
        users: users
    })
    
    fs.writeFile('users.js', `let users = ${JSON.stringify(users, null, 2)};\nmodule.exports.users=users;`, (err) => {
        if (err) {
            return res.status(500).send({ message: "Failed to save user to file" });
        }
    })
})

//Update a user by passing id
app.patch('/users/update/:id',(req,res)=>{
    const id=parseInt(req.params.id);
    const updatedData=req.body;
    if (!updatedData.name || !updatedData.email || !updatedData.phone_number) {
        return res.status(400).send({ message: "The field (name, email, phone_number) are required to update" });
    }
    const userIndex=users.findIndex(u=>u.id===id);
    console.log(updatedData)
    console.log(userIndex)
    if(userIndex!==-1){
        const updatedUser={...users[userIndex],...updatedData};
        users[userIndex]=updatedUser;
        
        fs.writeFile('users.js',`let users=${JSON.stringify(users,null,2)};\nmodule.exports.users = users;`,(err)=>{
            return res.status(500).send({ message: "Failed to save updated users list to file" });
        })

        res.send({
            message:`User with ${id} has been updated`,
            updatedUser:updatedUser
        })
    }
    else {
        res.status(404).send({ message: `User with ID ${id} not found.` });
    }

})

//Delete a user by passing id
app.delete('/users/delete/:id', (req, res) => {
    const id = parseInt(req.params.id);  
    const userIndex = users.findIndex(u => u.id === id);  

    if (userIndex !== -1) {
        const deletedUser = users.splice(userIndex, 1);  
        
        fs.writeFile('users.js', `let users = ${JSON.stringify(users, null, 2)};\nmodule.exports.users = users;`, (err) => {
            if (err) {
                return res.status(500).send({ message: "Failed to save updated users list to file" });
            }
        });
        res.send({
            message: `User with ID ${id} has been deleted.`,
            users: users
        });
    } else {
        res.status(404).send({ message: `User with ID ${id} not found.` });
    }
});


app.listen(port, () => {
    console.log("Server listening on the port:", port);
})