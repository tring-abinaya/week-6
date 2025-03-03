import pool from './dbConnect.js';
import { ApolloServer, gql } from 'apollo-server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const typeDefs = gql`
    type Persona{
        persona_id:Int
        name:String
        image:String
        quote:String
        description:String
        motivations:String
        pain_points:String
        jobs_needs:String
        activities:String
        user_id:Int
    }
    type Query{
        getPersonas:[Persona]
        getPersonaById(personaId:Int!):Persona
    }
    
    input CreateUserInput{
        email:String!
        password:String!
        age:Int!
        phone_number:String!
    }

    input CreatePersonaInput{
        image:String!
        name:String!
        quote:String
        description:String
        motivations:String
        pain_points:String
        jobs_needs:String
        activities:String
    }

    input UpdatePersonaInput{
        personaId:Int!
        image:String
        name:String
        quote:String
        description:String
        motivations:String
        pain_points:String
        jobs_needs:String
        activities:String
    }

    type Token{
        token:String!
    }

    type Mutation{
        
        signup(createUserInput: CreateUserInput!):String
        signin(email:String!,password:String!):Token
        addPersona(createPersonaInput: CreatePersonaInput!):String
        updatePersona(updatePersonaInput:UpdatePersonaInput!):String
        deletePersona(personaId:Int!):String
    }

`;

const verifyJWT =async (token) => {
    let userToken;
    try {
        if(!token){
            throw new Error('Unauthorized')
        }
        console.log("Original token:",token)
        if(token.includes('Bearer')){
            userToken=token.split(" ")[1];
        } else{
            userToken=token;
        }

        console.log("userToken:",userToken)
        const verification = await jwt.verify(userToken, 'secret')
        console.log("--",verification)
        const data=JSON.parse(verification.data)
        return data.user_id
    } catch(err) {
        console.log(err)
        throw new Error(err.message);    
    }
}

const resolvers = {
    Query: {
        getPersonas: async (_, args, context) => {


            console.log(context.authorization)
            const token = context.authorization;
            const userId = await verifyJWT(token)
            console.log(userId)

            const personas = await pool.query('SELECT * FROM personas WHERE user_id=$1',[userId]);
            console.log(personas.rows)
            return personas.rows
        },
        getPersonaById:async(_,args,context)=>{
            console.log(args)
            const token=(context.authorization);

            const userId=await verifyJWT(token)
            const persona=await pool.query('SELECT * FROM personas WHERE user_id=$1 AND persona_id=$2',[userId,args.personaId])
            console.log(persona.rows)
            return persona.rows[0]
        }
    },

    Mutation: {
        signup: async (_, { createUserInput }) => {

            console.log(createUserInput)

            const checkUser = await pool.query('SELECT email FROM users WHERE email=$1', [createUserInput.email])
            if (checkUser.rows.length > 0) {
                throw new Error('User Already Exists');
            }

            const hashedPassword = await bcrypt.hash(createUserInput.password, 10);  // 10 is the salt rounds

            if (createUserInput.phone_number.length > 10) {
                console.log("Too Long")
            }
            console.log("No long")

            const result = await pool.query(
                'INSERT INTO users(email,pwd,age,phone_no) VALUES ($1,$2,$3,$4)',
                [createUserInput.email, hashedPassword, createUserInput.age, createUserInput.phone_number]

            )
            return 'User Created Successfully'
        },

        signin: async (_, args) => {

            console.log(args)

            const getUser = await pool.query('SELECT user_id ,email,pwd FROM users WHERE email=$1', [args.email])

            console.log(getUser.rows)

            if (getUser.rows.length === 0) {
                throw new Error('User does not exist')
            }
            const storedHashedPassword = getUser.rows[0].pwd;

            console.log("hashed:", storedHashedPassword)
            console.log("argsPwd:", args.password)

            // Compare the entered password with the stored hashed password
            const isPasswordValid = await bcrypt.compare(args.password, storedHashedPassword);

            console.log(isPasswordValid)
            if (!isPasswordValid) {
                throw new Error('Incorrect email or password'); // Return an error if the passwords don't match
            }

            const token = await jwt.sign({
                data: JSON.stringify({
                    user_id: getUser.rows[0].user_id,
                    email: getUser.rows[0].email
                })
            }, 'secret', { expiresIn: '1h' })

            console.log(token)

            return { token };
        },

        addPersona:async(_,{createPersonaInput},context)=>{
            const token=context.authorization;
            const userId=await verifyJWT(token);
            const {image,name,quote,description,motivations,pain_points,jobs_needs,activities}=createPersonaInput;
            console.log("Persona:",createPersonaInput)
            console.log("values -> name: ",name,"Image:",image,"quote:",quote,"Description:",description)
            const addPerson=await pool.query('INSERT INTO personas(image,name,quote,description,motivations,pain_points,jobs_needs,activities,user_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
                                              [image,name,quote,description,motivations,pain_points,jobs_needs,activities,userId]);
            console.log(addPerson.rows)
            return 'Persona added sucessfully'
        },

        updatePersona:async(_,{updatePersonaInput},context)=>{
            const token=context.authorization;
            const userId=await verifyJWT(token);
            const {personaId,image,name,quote,description,motivations,pain_points,jobs_needs,activities}=updatePersonaInput;
            console.log("Persona:",updatePersonaInput)
            console.log("values -> name: ",name,"Image:",image,"quote:",quote,"Description:",description)
            const updatePerson=await pool.query('UPDATE personas SET image=$1,name=$2,quote=$3,description=$4,motivations=$5,pain_points=$6,jobs_needs=$7,activities=$8 WHERE user_id=$9 AND persona_id=$10',
                                                [image,name,quote,description,motivations,pain_points,jobs_needs,activities,userId,personaId])
            console.log(updatePerson.rows)
            return "Persona updated successfully"
        },

        deletePersona:async(_,args,context)=>{
            const token=context.authorization;
            const userId=await verifyJWT(token);
            console.log("persona id :",args.personaId)
            console.log("persona id :",typeof(args.personaId))
            const deletePerson=await pool.query('DELETE FROM personas WHERE user_id=$1 AND persona_id=$2',[userId,args.personaId])
            console.log(deletePerson.rows)
            return "Persona deleted successfully"
        }

    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
        ...req.headers
    })
})

server.listen().then(({ url }) => {
    console.log(`Sever running at ${url}`)
})