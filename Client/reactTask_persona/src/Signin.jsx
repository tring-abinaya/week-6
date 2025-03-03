import Home from './Home.jsx';
import './Signin.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useForm } from 'react-hook-form';

import { gql, useMutation } from '@apollo/client';

const SIGNIN_MUTATION = gql`
    mutation signin($email: String!, $password: String!){
        signin(email: $email, password: $password) {
            token
    }
}
`;

function Signin() {

    const [passwordVisible, setPasswordVisible] = useState(false);
    const navigate = useNavigate();

    const [error, setError] = useState(null)

    const [signinMutation] = useMutation(SIGNIN_MUTATION, {
        fetchPolicy: "no-cache",
        onCompleted: (data) => {
            localStorage.setItem("token",data.signin.token)
            navigate('/Persona')
        },
        onError: (err) => {
            setError(err.message)
        }
    });

    const signin = async (values) => {
        try {

            await signinMutation({
                variables: {
                    email: values.email,
                    password: values.password,
                },
            });

        } catch (err) {
            console.error('Error during GraphQL request', err);
        }
    }

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    }

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm();

    return (
        <>

            <Home />

            <div className="signin-containter">

                <h1>Sign In</h1>



                <form onSubmit={handleSubmit(signin)}>

                    <input
                        type="text"
                        placeholder="Enter your email"
                        name="email"
                        {...register("email", {
                            required: {
                                value: true, message: "Email is required"
                            }, pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i, message: "Enter valid email" }
                        })}
                    />
                    {errors.email && <span className='error'>{errors.email.message}</span>}
                    <input
                        type={passwordVisible ? "text" : "password"}
                        placeholder="Enter your password"
                        name="password"
                        {...register("password", {
                            required: {
                                value: true, message: "Password is required"
                            }
                        })}
                    />
                    {errors.password && <span className='error'>{errors.password.message}</span>}

                    <span onClick={togglePasswordVisibility} className="password-eye-icon">
                        {passwordVisible ? <FaEye /> : <FaEyeSlash />}
                    </span>

                    <input type="submit" className='signin_btn' value="Sign In" />


                </form>

            </div>


            {error &&
                <span className='usersNotFound'>{error}</span>
            }

        </>
    )
}

export default Signin

