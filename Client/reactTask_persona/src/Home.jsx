import { useNavigate } from "react-router-dom"

function Home(){

    const navigate=useNavigate();

    const signin=()=>{
        navigate('/Signin')
    }

    const signup=()=>{
        navigate('/Signup')
    }

    return(
        <div className='header'>
        <h2>tringapps</h2>
        <h1>Persona</h1>
        <div className='btns'>
          <button className='login' onClick={signin}>Sign in</button>
          <button className='signup'onClick={signup}>Sign up</button>
        </div>
      </div>
    )
}

export default Home