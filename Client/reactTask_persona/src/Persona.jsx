import { useEffect, useState } from 'react';
import './Persona.css';
import { useNavigate, useParams } from "react-router-dom"
import { gql, useLazyQuery, useMutation} from '@apollo/client';

const GET_PERSONA=gql`
  query{
    getPersonas {
      persona_id
      image
      name
    }
  }
`;


function Persona() {

  const [showPersona, setShowPersona] = useState([]);
  const [personaCardIndex, setPersonaCardIndex] = useState(-1)
  const navigate = useNavigate();

  const addPersona = () => {
    navigate('/Persona/Save')
 }

  const editPersona = (id) => {
    navigate(`/Persona/Save/${id}`)
  }


  const [getPersonas]=useLazyQuery(GET_PERSONA,{
    fetchPolicy:"no-cache",
    onCompleted:(data)=>{
      console.log(data)
      setShowPersona(data.getPersonas)
    },
    onError:(err)=>{
      console.log(err)
    }
  })

  useEffect(() => {
    getPersonas()
  }, [])

  return (
    <>

      <div className='header'>
        <h2>tringapps</h2>
        <h1>Persona</h1>
        <div className='btns'>
          <button className='login' onClick={() => { 
            localStorage.removeItem('token');
            navigate("/signin") }}>Logout
          </button>
        </div>
      </div>

      <div className="addPersonaContainer">
        <p className='addPersonaRight' onClick={addPersona}>+ Add Persona</p>

        <div className='card-container'  >
          {showPersona?.map((persona, index) => (
            <div className='card' key={index} onClick={() => editPersona(persona.persona_id)}>
              <div className='cardImage'>
                <img src={persona.image} alt='Persona' />
              </div>
              <div className='cardContent'>
                <h3>{persona.name}</h3>
              </div>
            </div>

          ))}

          <div className='card' onClick={addPersona}>

            <button className="add" onClick={addPersona}>+</button>
            <p style={{ color: 'grey', fontSize: "18px" }}>Add a Persona</p>
          </div>

        </div>
      </div>

    </>

  )
}

export default Persona