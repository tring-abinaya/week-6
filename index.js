import { users } from './users.js'
import { ApolloServer } from 'apollo-server'
import fs from 'fs';
const typeDefs = `
    type Query{
        getUsers:[User]
        getUser(id:ID!):User
    }
    type Mutation{
        addUser(name:String!,email:String!,phone_number:String!):User
        updateUser(id: ID!, name: String, email: String,phone_number:String): User 
        deleteUser(id: ID!): String
    }
    type User{
        id:ID
        name:String
        email:String
        phone_number:String    
    }
`;

const resolvers = {
    Query: {
        getUsers: () => {
            return users;
        },
        getUser: (_, args) => {
            const id = parseInt(args.id);
            const user = users.find(user => user.id === id)
            if (!user) {
                throw new Error('User not found');
            } else {
                return user
            }
        }
    },
    Mutation: {
        addUser: (_, args) => {
            const { name, email, phone_number } = args;
            const newUser = {
                id: users.length > 0 ? (users[(users.length - 1)].id + 1) : 1,
                name,
                email,
                phone_number
            }
            users.push(newUser)

            fs.writeFile('users.js', `export let users=${JSON.stringify(users, null, 2)}`, (err) => {
                if (err) {
                    throw new Error('Failed to save')
                }
            })

            return newUser;
        },
        updateUser: (_, args) => {
            const id = parseInt(args.id);
            const user = users.find(user => user.id === id);
            if (!user) {
                throw new Error('User not found');
            }
            if (args.name) {
                user.name = args.name;
            }
            if (args.email) {
                user.email = args.email;
            }
            if (args.phone_number) {
                user.phone_number = args.phone_number;
            }


            fs.writeFile('users.js', `export let users=${JSON.stringify(users, null, 2)}`, (err) => {
                if (err) {
                    throw new Error('Failed to update')
                }
            })
            return user;

        },
        deleteUser: (_, args) => {
            const id = parseInt(args.id);
            const index = users.findIndex(user => user.id === id);
            if (index === -1) {
                throw new Error('User not found');
            }
            const deletedUser = users.splice(index, 1);
            console.log("Deleted:",deletedUser)
            fs.writeFile('users.js', `export let users=${JSON.stringify(users, null, 2)}`, (err) => {
                if (err) {
                    throw new Error('Failed to delete')
                }
            })
            return `User with ID ${id} is deleted ${JSON.stringify(deletedUser)}`;
        }

    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers
});

server.listen().then(({ url }) => {
    console.log(`Server running at ${url}`);
});